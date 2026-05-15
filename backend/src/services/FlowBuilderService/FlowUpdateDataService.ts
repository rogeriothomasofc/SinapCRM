import { FlowBuilderModel } from "../../models/FlowBuilder";
import { WebhookModel } from "../../models/Webhook";
import { randomString } from "../../utils/randomCode";

interface node {
    id: string,
    position: { x: number, y: number },
    data: { 
        label: string
        sec?: number
        title?: string
        text?: string
    },
    type: string,
    style: { backgroundColor: string, color: string }
}

interface body {
    nodes : node
    idFlow: number
    connections: any
    trigger?: any
    rules?: any
}


interface Request {
  companyId: number;
  bodyData: body;
}

const FlowUpdateDataService = async ({
  companyId,
  bodyData
}: Request): Promise<String> => {
  try {

    const flow = await FlowBuilderModel.update({
        flow: {
            nodes: bodyData.nodes,
            connections: bodyData.connections,
            trigger: bodyData.trigger || null,
            rules: bodyData.rules || null
        }
    },{
      where: {id: bodyData.idFlow, company_id: companyId}
    });

    return 'ok';
  } catch (error) {
    console.error("Erro ao inserir o usuário:", error);

    return error
  }
};

export default FlowUpdateDataService;
