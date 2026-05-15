import FollowUp from "../../models/FollowUp";

const ListService = async (companyId: number): Promise<FollowUp[]> => {
  return FollowUp.findAll({ where: { companyId }, order: [["createdAt", "ASC"]] });
};

export default ListService;
