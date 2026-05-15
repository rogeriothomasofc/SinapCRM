import { Request, Response } from "express";
import AppError from "../errors/AppError";
import TicketTag from '../models/TicketTag';
import Tag from '../models/Tag'
import TriggerFollowUpService from "../services/FollowUpService/TriggerFollowUpService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId, tagId } = req.params;

  try {
    const ticketTag = await TicketTag.create({ ticketId, tagId } as any);

    // Fire follow-up triggers for kanban columns
    const tag = await Tag.findOne({ where: { id: tagId } });
    if (tag && tag.kanban === 1) {
      TriggerFollowUpService(parseInt(ticketId), parseInt(tagId), "enter").catch(() => {});
    }

    return res.status(201).json(ticketTag);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to store ticket tag.' });
  }
};

/*
export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;



  try {
    await TicketTag.destroy({ where: { ticketId } });
    return res.status(200).json({ message: 'Ticket tags removed successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove ticket tags.' });
  }
};
*/
export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;


  try {
    // Retrieve tagIds associated with the provided ticketId from TicketTags
    const ticketTags = await TicketTag.findAll({ where: { ticketId } });
    const tagIds = ticketTags.map((ticketTag) => ticketTag.tagId);

    // Find the tagIds with kanban = 1 in the Tags table
    const tagsWithKanbanOne = await Tag.findAll({
      where: {
        id: tagIds,
        kanban: 1,
      },
    });

    // Remove the tagIds with kanban = 1 from TicketTags
    const tagIdsWithKanbanOne = tagsWithKanbanOne.map((tag) => tag.id);
    if (tagIdsWithKanbanOne.length > 0) {
      await TicketTag.destroy({ where: { ticketId, tagId: tagIdsWithKanbanOne } });

      // Fire exit follow-up triggers for removed kanban columns
      for (const removedTagId of tagIdsWithKanbanOne) {
        TriggerFollowUpService(parseInt(ticketId), removedTagId, "exit").catch(() => {});
      }
    }

    return res.status(200).json({ message: 'Ticket tags removed successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove ticket tags.' });
  }
};
