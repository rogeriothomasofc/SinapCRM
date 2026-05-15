import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import Company from "./models/Company";
import { startQueueProcess } from "./queues";
import { TransferTicketQueue } from "./wbotTransferTicketQueue";
import cron from "node-cron";
import { Op } from "sequelize";
import FollowUpSchedule from "./models/FollowUpSchedule";
import FollowUp from "./models/FollowUp";
import ExecuteActionsService from "./services/FollowUpService/ExecuteActionsService";

const server = app.listen(process.env.PORT, async () => {
  const companies = await Company.findAll();
  const allPromises: any[] = [];
  companies.map(async c => {
    const promise = StartAllWhatsAppsSessions(c.id);
    allPromises.push(promise);
  });

  Promise.all(allPromises).then(() => {
    startQueueProcess();
  });
  logger.info(`Server started on port: ${process.env.PORT}`);
});

cron.schedule("* * * * *", async () => {

  try {
    logger.info(`Serviço de transferencia de tickets iniciado`);
    await TransferTicketQueue();
  }
  catch (error) {
    logger.error(error);
  }

});

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const pending = await FollowUpSchedule.findAll({
      where: { status: "pending", sendAt: { [Op.lte]: now } },
      include: [{ model: FollowUp, as: "followUp" }],
    });

    for (const schedule of pending) {
      await schedule.update({ status: "executed" });
      await ExecuteActionsService((schedule as any).followUp, schedule.ticketId);
    }
  } catch (error) {
    logger.error(`FollowUp cron error: ${error}`);
  }
});

initIO(server);
gracefulShutdown(server);
