import Plan from "../../models/Plan";

const FindAllPlanService = async (publicOnly = false): Promise<Plan[]> => {
  const where = publicOnly ? { isPublic: true } : {};
  const plan = await Plan.findAll({ where, order: [["name", "ASC"]] });
  return plan;
};

export default FindAllPlanService;
