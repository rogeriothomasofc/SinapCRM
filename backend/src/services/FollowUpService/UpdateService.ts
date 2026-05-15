import FollowUp from "../../models/FollowUp";

interface Request {
  id: number;
  companyId: number;
  name?: string;
  funnelConfig?: object;
  triggerType?: string;
  triggerTime?: object;
  actions?: object[];
  rules?: object;
  active?: boolean;
}

const UpdateService = async ({ id, companyId, ...data }: Request): Promise<FollowUp> => {
  const record = await FollowUp.findOne({ where: { id, companyId } });
  if (!record) throw new Error("FollowUp not found");
  await record.update(data);
  return record;
};

export default UpdateService;
