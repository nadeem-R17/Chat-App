const { Group, GroupMember } = require("../model/groupModel");
const User = require("../model/userModel");
const { createGroupSchema, updateGroupSchema, groupDetailsSchema, memberStatusSchema } = require("../validations/groupValidation");

const createGroup = async (req, res) => {

  const { error } = createGroupSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const { groupName, groupAvatar, groupDescription, members, userId } = req.body;

  if (!groupName || !members || !userId) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const group = new Group({
      groupName,
      groupAvatar,
      groupDescription,
      groupAdminId: userId,
    });
    await group.save();

    const groupAdmin = new GroupMember({
      groupId: group._id,
      userId,
      isAdmin: true,
    });

    await groupAdmin.save();

    const groupId = group._id;
    const saveGroupMembers = members.map(async (member) => {
      const groupMember = new GroupMember({
        groupId,
        userId: member,
      });
      await groupMember.save();
    });

    const groupCreated = {
      groupId: group._id,
      groupName: group.groupName,
      groupAvatar: group.groupAvatar,
      groupDescription: group.groupDescription,
      groupAdminId: group.groupAdminId,
    };

    res.status(201).json({ message: "Group created successfully", groupCreated });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const groupDetails = async (req, res) => {
  // console.log("Getting group details...");

  const { error } = groupDetailsSchema.validate(req.query);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const { groupId } = req.query;

  // console.log("Group Id in getting group details", groupId);

  if (!groupId) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const groupMembersIds = await GroupMember.find({ groupId, status: "active" }).select("userId");

    // console.log("Group members IDs in getting groupdetails: ", groupMembersIds);

    const groupMembers = await Promise.all(
      groupMembersIds.map(async (member) => {
        const userDetail = await User.findById(member.userId).select(
          "email profilePicture fullName"
        );

        return {
          userId: member.userId,
          email: userDetail.email,
          profilePicture: userDetail.profilePicture,
          fullName: userDetail.fullName,
        };
      })
    );

    const groupMemberIdsArray = groupMembers.map((member) => member.userId);

    // console.log("Group members IDs array", groupMemberIdsArray);

    // console.log("Group members", groupMembers);

    const groupData = {
      groupId: group._id,
      groupName: group.groupName,
      groupAvatar: group.groupAvatar,
      groupDescription: group.groupDescription,
      groupAdminId: group.groupAdminId,
      groupMembers,
      groupMemberIdsArray,
    };

    res.status(200).json(groupData);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateGroup = async (req, res) => {
  // console.log("Updating group details....");

  const { error } = updateGroupSchema.validate(req.body);

  if (error) {
    console.log("Invalid group data", error);
    return res.status(400).json({ message: error.message });
  }

  const { groupId, groupName, groupAvatar, groupDescription, members } = req.body;

  if (!groupId || !groupName || !members) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (groupName && groupName !== group.groupName) {
      group.groupName = groupName;
    }

    if (groupAvatar && groupAvatar !== group.groupAvatar) {
      group.groupAvatar = groupAvatar;
    }

    if (groupDescription && groupDescription !== group.groupDescription) {
      group.groupDescription = groupDescription;
    }

    await group.save();

    const groupMembers = await GroupMember.find({ groupId, status: "active" }).select("userId");
    const inactiveMembers = await GroupMember.find({ groupId, status: "inactive" }).select("userId");


    // Convert groupMembers to an array of user IDs
    const groupMemberIds = groupMembers.map((member) => member.userId.toString());
    const inactiveMemberIds = inactiveMembers.map((member) => member.userId.toString());


    // Remove members that are no longer in the new members list
    const removalPromises = groupMembers.map(async (member) => {
      if (!members.includes(member.userId.toString())) {
        const removeUser = await GroupMember.findOne({ userId: member.userId });
        removeUser.status = "inactive";
        removeUser.leftAt = Date.now();
        await removeUser.save();
      }
    });

    await Promise.all(removalPromises);

    // Add new members that are not already in the group
    for (const member of members) {
      if (inactiveMemberIds.includes(member)) {
        const groupMember = await GroupMember
          .findOne({ groupId, userId: member })
          .select("status leftAt");
        
          if (groupMember.status === "inactive") {
            groupMember.status = "active";
            groupMember.leftAt = null;
            await groupMember.save();
          }
      }
      else if (!groupMemberIds.includes(member)) {
        const groupMember = new GroupMember({
          groupId,
          userId: member,
        });
        await groupMember.save();
      }
    }

    res.status(200).json({ message: "Group updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const memberStatus = async (req, res) => {
  // console.log("Checking member status...");

  const { error } = memberStatusSchema.validate(req.query);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const { groupId, userId } = req.query;

  // console.log("Group Id", groupId);
  // console.log("User Id", userId);

  if (!groupId || !userId) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const groupMember = await GroupMember.findOne({
      groupId: groupId,
      userId: userId,
    });

    // console.log("Group member", groupMember);

    if (!groupMember) {
      return res.status(200).json(false);
    }
    else {
      return res.status(200).json(groupMember.status === "active");
    }

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createGroup, groupDetails, updateGroup, memberStatus };
