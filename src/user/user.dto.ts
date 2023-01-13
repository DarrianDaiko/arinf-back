import { ApiProperty } from "@nestjs/swagger";
import { UserModel } from "./user.model";

export class CreateUserDto {
    @ApiProperty()
    name: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    blockchainAddress: string;
    password: string;

    static toModel(dto: CreateUserDto): UserModel {
        var model = new UserModel();
        model.email = dto.email;
        model.name = dto.name;
        model.password = dto.password;
        model.blockchainAddress = dto.blockchainAddress;
        return model;
    }
}

export class UpdateUserDto {
    @ApiProperty()
    name: string;
    @ApiProperty()
    email: string;
    password: string;
    teamId: number;

    static toModel(dto: UpdateUserDto): UserModel {

        if (!dto)
            return null;

        var model = new UserModel();
        model.email = dto.email;
        model.name = dto.name;
        model.password = dto.password;
        model.teamId = dto.teamId;
        return model;
    }
}

export class UserDto {
    @ApiProperty()
    id: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    role: string;
    @ApiProperty()
    blockchainAddress: string;
    teamId: number;
    password: string;

    static toModel(dto: UserDto): UserModel {

        if (!dto)
            return null;

        var model = new UserModel();
        model.email = dto.email;
        model.name = dto.name;
        model.password = dto.password;
        model.role = dto.role;
        model.blockchainAddress = dto.blockchainAddress;
        model.teamId = dto.teamId;
        return model;
    }
}