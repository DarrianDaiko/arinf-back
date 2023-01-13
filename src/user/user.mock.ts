import { UserModel } from "./user.model";
import { User } from "@prisma/client";
import { HttpException } from "@nestjs/common";
import { Role } from "./role/role.enum";

  // Generic method to create a user
export const createUser = (mockUserRep: any, id: number, name: string, email: string, 
    blockchainAddress: string, password: string, role: Role): User => {
    const user = new UserModel();
    user.id = id;
    user.name = name;
    user.email = email;
    user.blockchainAddress = blockchainAddress;
    user.password = password;
    user.role = role;
    user.teamId = null;

    return mockUserRep.createUser(user);

  };

export const mockUserRep = {

    userArray: [],
    index : 0,

    getLength: jest.fn().mockImplementation(() => {
        return mockUserRep.userArray.length;
    }),

    pushUser: jest.fn().mockImplementation((user: User) => {
        mockUserRep.userArray.push(user);
    }),

    createUser: jest.fn().mockImplementation(userData => {
      var mod = userData as UserModel;
  
      if (!mod.email || !mod.password || !mod.blockchainAddress)
        throw new Error('Missing email, password or blockchainAddress');
  
      // email must be unique
      if (mockUserRep.userArray.find((user) => user.email === mod.email))
        throw new HttpException('User already exists', 409);
  
      mod.role = mod.role ? mod.role : Role.User;
  
      let user = {
        id: mockUserRep.index++,
        email: mod.email,
        name: mod.name,
        password: mod.password,
        blockChainAddress: mod.blockchainAddress,
        role: mod.role,
        deletedAt: null,
        teamId: mod.teamId
      }
  
      mockUserRep.userArray.push(user);
      return user;
    }),
    updateUser: jest.fn().mockImplementation((id: number, userData) => {
  
      let elt = mockUserRep.userArray.find((user) => user.id === id);
      if (!elt)
        throw new HttpException('User not found', 404);
      if (!userData)
        return elt;
      elt.email = userData.email ? userData.email : elt.email;
      elt.name = userData.name ? userData.name : elt.name;
      elt.password = userData.password ? userData.password : elt.password;
      elt.blockChainAddress = userData.blockchainAddress ? userData.blockchainAddress : elt.blockChainAddress;
      elt.role = userData.role ? userData.role : elt.role;
      elt.teamId = userData.teamId ? userData.teamId : elt.teamId;
      return elt;
  
    }),
    deleteUser: jest.fn().mockImplementation((id) => {
      let elt = mockUserRep.userArray.find((user) => user.id === id);
      mockUserRep.userArray = mockUserRep.userArray.filter((user) => user.id !== id);
      return elt;
    }),
    getUser: jest.fn().mockImplementation((id) => {
      return mockUserRep.userArray.find((user) => user.id == id);
      
    }),
    getByEmail: jest.fn().mockImplementation((email) => {
      return mockUserRep.userArray.find((user) => user.email == email);
    }),
    doesUserExists: jest.fn().mockImplementation((id) => {
      let u = mockUserRep.userArray.find((user) => user.id == id);
      return u != null;
    }),
    getUsers: jest.fn().mockImplementation((limit, offset) => {
  
      // get users from userArray with limit and offset
      return mockUserRep.userArray.slice(offset, offset + limit);
  
    }),
    isAdmin: jest.fn().mockImplementation((id) => {
      let elt = mockUserRep.userArray.find((user) => user.id == id);
      if (!elt) return false;
      return elt.role == Role.Admin;
    }),
    leaveTeam: jest.fn().mockImplementation((id) => {
        let elt = mockUserRep.userArray.find((user) => user.id == id);
        if (!elt) throw new HttpException('User not found', 404);
        elt.teamId = null;
        return elt;
        }),
    joinTeam: jest.fn().mockImplementation((id, teamId) => {
        let elt = mockUserRep.userArray.find((user) => user.id == id);
        if (!elt) throw new HttpException('User not found', 404);
        elt.teamId = teamId;
        return elt;
        }),
  };