import { Team } from "@prisma/client";
import { TeamDto } from "./team.dto";

export class TeamModel
{
    name: string;
    id: number;
    members: number[];
    balance : number;
    creatorId : number;

    // to Dto
    toDto() : TeamDto
    {
        var dto = new TeamDto();
        dto.id = this.id;
        dto.name = this.name;
        dto.members = this.members;
        dto.balance = this.balance;
        dto.creatorId = this.creatorId;
        return dto;
    }

    static fromEntity(entity : Team) : TeamModel
    {
        var model = new TeamModel();
        model.id = entity.id;
        model.name = entity.name;
        model.members = entity.usersId;
        model.balance = entity.balance;
        model.creatorId = entity.creatorId;
        return model;
    }
}