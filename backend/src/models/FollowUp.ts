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
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";

@Table
class FollowUp extends Model<FollowUp> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column(DataType.JSON)
  funnelConfig: { tagIds: number[] };

  @Column(DataType.STRING)
  triggerType: string;

  @Column(DataType.JSON)
  triggerTime: { days: number; hours: number; minutes: number };

  @Column(DataType.JSON)
  actions: object[];

  @Column(DataType.JSON)
  rules: { cancelOnResponse: boolean; allowGroups: boolean; customSignature: boolean };

  @Column({ defaultValue: true })
  active: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default FollowUp;
