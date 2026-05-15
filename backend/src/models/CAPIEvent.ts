import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";
import Ticket from "./Ticket";

@Table({ tableName: "CAPIEvents" })
class CAPIEvent extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id: number;

  @ForeignKey(() => Ticket)
  @Column({ type: DataType.INTEGER, allowNull: false })
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @Column({ type: DataType.INTEGER, allowNull: false })
  companyId: number;

  @Column({ type: DataType.STRING, allowNull: true })
  ctwaClid: string;

  @Column({ type: DataType.STRING, allowNull: false })
  eventName: string;

  @Column({ type: DataType.STRING, allowNull: true })
  phoneNumber: string;

  @Column({
    type: DataType.ENUM("sent", "failed"),
    allowNull: false,
    defaultValue: "sent"
  })
  status: "sent" | "failed";

  @Column({ type: DataType.TEXT, allowNull: true })
  responsePayload: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  errorMessage: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CAPIEvent;
