import { ApiProperty } from "@nestjs/swagger";
import { TeamModel } from "./team.model";

export class CreateTeamDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  members: number[];
  @ApiProperty()
  balance: number;
  creatorId: number;

  static toModel(dto: CreateTeamDto): TeamModel {
    if (!dto)
      return null;
    var r = new TeamModel();

    r.name = dto.name;
    r.creatorId = dto.creatorId;
    r.members = dto.members;
    r.balance = dto.balance;

    return r;
  }
}

export class UpdateTeamDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  members: number[];
  @ApiProperty()
  balance: number;

  static toModel(dto: UpdateTeamDto): TeamModel {

    if (!dto)
      return null;
    var r = new TeamModel();

    r.name = dto.name;
    r.members = dto.members;
    r.balance = dto.balance;

    return r;
  }
}

export class TeamDto {
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  members: number[];
  @ApiProperty()
  balance: number;
  creatorId: number;

  static toModel(dto: TeamDto): TeamModel {

    if (!dto)
      return null;
    var r = new TeamModel();

    r.name = dto.name;
    r.creatorId = dto.creatorId;
    r.members = dto.members;
    r.id = dto.id;
    r.balance = dto.balance;

    return r;
  }
}

