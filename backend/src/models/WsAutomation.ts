import {
  Table, Column, CreatedAt, UpdatedAt, Model,
  PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo,
} from "sequelize-typescript";
import Company from "./Company";

export const WS_EVENT_TYPES = [
  "order_confirmed",
  "cart_abandoned",
  "back_in_stock",
  "payment_pix_pending",
  "payment_gateway_pending",
] as const;

export type WsEventType = typeof WS_EVENT_TYPES[number];

export const WS_DEFAULT_TEMPLATES: Record<WsEventType, string> = {
  order_confirmed:
    "Olá, {{nome}}! 🛍️ Recebemos seu pedido de {{total}} na {{loja}} e já estamos preparando tudo com carinho. Qualquer novidade, te avisamos por aqui. Obrigado pela compra!",
  cart_abandoned:
    "Oi, {{nome}}! 👋 Vimos que você deixou {{itens}} no carrinho da {{loja}} ({{total}}). Quer finalizar sua compra? {{link}}",
  back_in_stock:
    "Oi, {{nome}}! 🎉 O produto \"{{produto}}\" que você queria voltou ao estoque na {{loja}}. Corre que pode acabar de novo! {{link}}",
  payment_pix_pending:
    "Oi, {{nome}}! 💙 Ainda não recebemos o comprovante do seu pedido #{{pedido}} de {{total}} na {{loja}}. Quando puder, manda por aqui. 😊",
  payment_gateway_pending:
    "Oi, {{nome}}! ⏰ Seu pedido #{{pedido}} de {{total}} na {{loja}} ainda está aguardando o pagamento. Precisa de ajuda? É só falar!",
};

@Table({ tableName: "WsAutomations" })
class WsAutomation extends Model<WsAutomation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company, "companyId")
  company: Company;

  @Column(DataType.STRING)
  eventType: WsEventType;

  @Column(DataType.TEXT)
  message: string;

  @Column({ defaultValue: true })
  enabled: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default WsAutomation;
