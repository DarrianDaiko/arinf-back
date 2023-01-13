import { ApiProperty } from "@nestjs/swagger";

export class AuthDTO
{
    name : string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;
}