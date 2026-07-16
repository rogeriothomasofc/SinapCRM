import Company from "../../models/Company";
import Plan from "../../models/Plan";

const DEFAULT_PLAN = {
    id: null,
    name: "Padrão",
    users: 9999,
    connections: 9999,
    queues: 9999,
    value: 0,
    useCampaigns: true,
    useSchedules: true,
    useInternalChat: true,
    useExternalApi: true,
    useKanban: true,
    useOpenAi: true,
    useIntegrations: true,
};

const ShowPlanCompanyService = async (id: string | number): Promise<any> => {
    const results = await Company.findAll({
        where: { id },
        limit: 1,
        attributes: ["id", "name", "email", "status", "dueDate", "createdAt", "phone"],
        include: [
            {
                model: Plan, as: "plan",
                attributes: [
                    "id",
                    "name",
                    "users",
                    "connections",
                    "queues",
                    "value",
                    "useCampaigns",
                    "useSchedules",
                    "useInternalChat",
                    "useExternalApi",
                    "useKanban",
                    "useOpenAi",
                    "useIntegrations"
                ]
            },
        ]
    });
    const company = results[0] ?? null;

    if (!company) return null;

    const plain = company.get({ plain: true }) as any;
    if (!plain.plan || !plain.plan.useKanban) {
        plain.plan = { ...DEFAULT_PLAN, ...(plain.plan || {}) };
    }

    return plain;
};

export default ShowPlanCompanyService;
