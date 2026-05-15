import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
} from "sequelize-typescript";

@Table
class WhitelabelConfig extends Model<WhitelabelConfig> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ defaultValue: "AtendecChat" })
  name: string;

  @Column({ type: DataType.STRING(500), allowNull: true })
  logoUrl: string;

  @Column({ type: DataType.STRING(500), allowNull: true })
  faviconUrl: string;

  @Column({ defaultValue: "#682ee2" })
  primaryColor: string;

  @Column({ defaultValue: "#ff5722" })
  secondaryColor: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default WhitelabelConfig;
