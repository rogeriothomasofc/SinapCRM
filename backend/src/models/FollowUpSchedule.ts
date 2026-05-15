import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import Company from "./Company";
import FollowUp from "./FollowUp";

@Table
class FollowUpSchedule extends Model<FollowUpSchedule> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => FollowUp)
  @Column
  followUpId: number;

  @BelongsTo(() => FollowUp)
  followUp: FollowUp;

  @Column
  ticketId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column(DataType.DATE)
  sendAt: Date;

  @Column({ defaultValue: "pending" })
  status: string; // pending | executed | cancelled

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default FollowUpSchedule;
