import FollowUp from "../../models/FollowUp";

const DeleteService = async (id: number, companyId: number): Promise<void> => {
  await FollowUp.destroy({ where: { id, companyId } });
};

export default DeleteService;
