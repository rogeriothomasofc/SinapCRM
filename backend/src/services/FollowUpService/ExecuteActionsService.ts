import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import TicketTag from "../../models/TicketTag";
import Tag from "../../models/Tag";
import FollowUp from "../../models/FollowUp";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import { logger } from "../../utils/logger";

const ExecuteActionsService = async (
  followUp: FollowUp,
  ticketId: number
): Promise<void> => {
  const ticket = await Ticket.findOne({
    where: { id: ticketId },
    include: [{ model: Contact, as: "contact" }],
  });

  if (!ticket) {
    logger.warn(`FollowUp ExecuteActions: ticket ${ticketId} not found`);
    return;
  }

  const actions: any[] = followUp.actions || [];

  for (const action of actions) {
    try {
      if (action.type === "message" && action.value) {
        await SendWhatsAppMessage({ body: action.value, ticket });
      } else if (action.type === "crmTab" && action.value) {
        const tagId = parseInt(action.value);
        // Remove all current kanban tags from this ticket
        const currentTags = await TicketTag.findAll({ where: { ticketId } });
        const tagIds = currentTags.map((tt: any) => tt.tagId);
        if (tagIds.length > 0) {
          const kanbanTags = await Tag.findAll({
            where: { id: tagIds, kanban: 1 },
          });
          const kanbanTagIds = kanbanTags.map((t: any) => t.id);
          if (kanbanTagIds.length > 0) {
            await TicketTag.destroy({ where: { ticketId, tagId: kanbanTagIds } });
          }
        }
        // Add the new kanban tab
        await TicketTag.create({ ticketId, tagId } as any);
      } else if (action.type === "label" && action.value) {
        const tagId = parseInt(action.value);
        const exists = await TicketTag.findOne({ where: { ticketId, tagId } });
        if (!exists) {
          await TicketTag.create({ ticketId, tagId } as any);
        }
      } else if (action.type === "transfer" && action.value) {
        const queueId = parseInt(action.value);
        await UpdateTicketService({
          ticketData: { queueId },
          ticketId,
          companyId: ticket.companyId,
        });
      }
    } catch (err) {
      logger.error(
        `FollowUp ExecuteActions: error on action type=${action.type} ticketId=${ticketId}: ${err}`
      );
    }
  }
};

export default ExecuteActionsService;
