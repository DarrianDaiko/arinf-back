import { User } from "@prisma/client";
import { UserDto } from "./user.dto";

export class UserModel
{
    id : number;
    blockchainAddress: string;
    email: string;
    password: string;
    name: string;
    role: string;
    teamId: number;

    // to Dto
    toDto() : UserDto
    {
        var dto = new UserDto();
        dto.id = this.id;
        dto.email = this.email;
        dto.name = this.name;
        dto.blockchainAddress = this.blockchainAddress;
        dto.password = this.password;
        dto.role = this.role;
        dto.teamId = this.teamId;
        return dto;

    }

    static fromEntity(entity : User) : UserModel
    {
        if (!entity)
            return null;
        var model = new UserModel();
        model.id = entity.id;
        model.email = entity.email;
        model.name = entity.name;
        model.blockchainAddress = entity.blockChainAddress;
        model.password = entity.password;
        model.role = entity.role;
        model.teamId = entity.teamId;
        return model;
    }
    
}