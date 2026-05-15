import FollowUp from "../../models/FollowUp";

interface Request {
  name: string;
  funnelConfig: object;
  triggerType: string;
  triggerTime?: object;
  actions?: object[];
  rules?: object;
  active?: boolean;
  companyId: number;
}

const CreateService = async (data: Request): Promise<FollowUp> => {
  return FollowUp.create(data as any);
};

export default CreateService;
