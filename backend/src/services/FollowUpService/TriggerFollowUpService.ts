import { Op } from "sequelize";
import moment from "moment";
import FollowUp from "../../models/FollowUp";
import FollowUpSchedule from "../../models/FollowUpSchedule";
import Ticket from "../../models/Ticket";
import ExecuteActionsService from "./ExecuteActionsService";
import { logger } from "../../utils/logger";

const TriggerFollowUpService = async (
  ticketId: number,
  tagId: number,
  event: "enter" | "exit"
): Promise<void> => {
  try {
    const ticket = await Ticket.findOne({ where: { id: ticketId } });
    if (!ticket) return;

    const { companyId } = ticket;

    const followUps = await FollowUp.findAll({
      where: { companyId, active: true, triggerType: event },
    });

    for (const followUp of followUps) {
      const funnelTagIds: number[] =
        (followUp.funnelConfig as any)?.tagIds || [];

      // If funnelConfig has specific tags, only trigger for those
      if (funnelTagIds.length > 0 && !funnelTagIds.includes(tagId)) {
        continue;
      }

      if (followUp.triggerType === "afterTime") {
        // This branch won't match since we filter by triggerType above,
        // but kept for clarity — afterTime schedules created separately
        continue;
      }

      await ExecuteActionsService(followUp, ticketId);
    }

    // Handle afterTime follow-ups that should schedule on enter
    const afterTimeFollowUps = await FollowUp.findAll({
      where: { companyId, active: true, triggerType: "afterTime" },
    });

    for (const followUp of afterTimeFollowUps) {
      const funnelTagIds: number[] =
        (followUp.funnelConfig as any)?.tagIds || [];

      if (funnelTagIds.length > 0 && !funnelTagIds.includes(tagId)) {
        continue;
      }

      // Only schedule on enter (afterTime triggers after ticket enters a funnel stage)
      if (event !== "enter") continue;

      const t = (followUp.triggerTime as any) || {};
      const delayMinutes =
        (parseInt(t.days) || 0) * 1440 +
        (parseInt(t.hours) || 0) * 60 +
        (parseInt(t.minutes) || 0);

      const sendAt = moment().add(delayMinutes, "minutes").toDate();

      // Cancel any existing pending schedules for this ticket+followup
      await FollowUpSchedule.update(
        { status: "cancelled" },
        { where: { ticketId, followUpId: followUp.id, status: "pending" } }
      );

      await FollowUpSchedule.create({
        followUpId: followUp.id,
        ticketId,
        companyId,
        sendAt,
        status: "pending",
      } as any);

      logger.info(
        `FollowUp scheduled: followUpId=${followUp.id} ticketId=${ticketId} sendAt=${sendAt}`
      );
    }
  } catch (err) {
    logger.error(`TriggerFollowUpService error: ${err}`);
  }
};

export default TriggerFollowUpService;
