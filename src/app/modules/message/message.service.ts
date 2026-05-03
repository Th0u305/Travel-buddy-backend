import { Context } from "hono";
import { getSupabase } from "../../middleware/supabase_auth_middleware.ts";
import { Prisma } from "../../lib/prisma.ts";

const sendMessage = async (c: Context) => {
  const supabase = getSupabase(c);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { status: 401, success: false, message: "Unauthorized" };
  }
  
  const sender_id = user.id;
  const body = await c.req.json();
  const { receiver_id, content, username_slug } = body;

  if (!receiver_id ) {
    return { status: 400, success: false, message: "Receiver ID is required" };
  }

  if (sender_id === receiver_id) {
    return { status: 400, success: false, message: "Cannot message yourself" };
  }

  const sharedRooms = await Prisma.room_participants.findMany({
    where: { user_id: sender_id },
    select: { room_id: true }
  });

  const receiverRoom = await Prisma.room_participants.findFirst({
    where: {
      user_id: receiver_id,
      room_id: { in: sharedRooms.map(r => r.room_id) },
      rooms: { is_group: false }
    }
  });

  let roomId = receiverRoom?.room_id;

  if (!roomId) {
    const newRoom = await Prisma.rooms.create({
      data: {
        is_group: false,
        created_by : user.id,
        name : username_slug,
        room_participants: {
          create: [
            { user_id: sender_id },
            { user_id: receiver_id }
          ]
        }
      }
    });
    roomId = newRoom.id;
  }

  const newMessage = await Prisma.messages.create({
    data: {
      room_id: roomId,
      sender_id: sender_id,
      receiver_id: receiver_id,
      content : content.length === 0 ? null : content ,
      type: "text"
    }
  });

  // Update room last_message_at
  await Prisma.rooms.update({
    where: { id: roomId },
    data: { last_message_at: new Date() }
  });

  return { status: 200, success: true, message: "Message sent", data: newMessage };
}

const getMessageHistory = async (c: Context) => {
  const supabase = getSupabase(c);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { status: 401, success: false, message: "Unauthorized" };
  }
  
  const sender_id = user.id;
  const receiver_id = c.req.param("receiver_id") as string;
  const userName_slug = c.req.param("user_name_slug") as string;

  if (!receiver_id) {
    return { status: 400, success: false, message: "Receiver ID is required" };
  }

  if (sender_id === receiver_id) {
    return { status: 400, success: false, message: "Cannot message yourself" };
  }

  const sharedRooms = await Prisma.room_participants.findMany({
    where: { user_id: sender_id },
    select: { room_id: true }
  });

  const receiverRoom = await Prisma.room_participants.findFirst({
    where: {
      user_id: receiver_id,
      room_id: { in: sharedRooms.map(r => r.room_id) },
      rooms: { is_group: false }
    }
  });

  let roomId = receiverRoom?.room_id;
  // deno-lint-ignore no-explicit-any
  let messages: any[] = [];

  if (roomId) {
    messages = await Prisma.messages.findMany({
      where: { room_id: roomId },
      orderBy: { created_at: 'asc' }
    });
  } 
  else {
    const newRoom = await Prisma.rooms.create({
      data: {
        is_group: false,
        created_by : user.id,
        name : userName_slug,
        room_participants: {
          create: [
            { user_id: sender_id },
            { user_id: receiver_id }
          ]
        }
      }
    });
    roomId = newRoom.id;
  }
  

  return { status: 200, success: true, message: "Messages fetched", data: { room_id: roomId, messages } };
}

const getChatUsers = async (c: Context) => {
  const supabase = getSupabase(c);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { status: 401, success: false, message: "Unauthorized" };
  }
  
  const sender_id = user.id;

  const userRooms = await Prisma.room_participants.findMany({
    where: { user_id: sender_id },
    select: { room_id: true }
  });

  const roomIds = userRooms.map(r => r.room_id);

  const rooms = await Prisma.rooms.findMany({
    where: {
      id: { in: roomIds },
      is_group: false,
    },
    include: {
      room_participants: {
        where: { user_id: { not: sender_id } },
        include: {
          profiles: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true,
              username_slug: true,
              bio: true
            }
          }
        }
      }
    },
    orderBy: {
      last_message_at: 'desc'
    },
    take: 12
  });

  const chatUsers = rooms.map(room => {
    const otherParticipant = room.room_participants[0]?.profiles;
    return {
      room_id: room.id,
      last_message_at: room.last_message_at,
      user: otherParticipant
    };
  }).filter(r => r.user != null);

  return { status: 200, success: true, message: "Chat users fetched", data: chatUsers };
}

export const messageService = {
    sendMessage,
    getMessageHistory,
    getChatUsers
}