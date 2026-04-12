import { v4 as uuidv4 } from "uuid";
import { prisma } from "../src/app/lib/prisma.ts";

const prismaQuery = async (email : string, name : string, password : string) => {
//   const hashedPassword = await hashPassword(password);
  const id = await uuidv4();
  const time =  await new Date().toISOString()
  const userId = await id +"_time_"+  time

//   const addUser = await prisma.profiles.create({
//     data: {
//       email: email,
//       full_name: name,
//       id : userId
//     }
//   });

//   return addUser
}
export default prismaQuery