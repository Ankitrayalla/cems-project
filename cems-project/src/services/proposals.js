import { supabase } from "../lib/supabase";

const ensureUserProfile = async (user) => {
  if (!user?.id) {
    throw new Error("You must be logged in to create an event");
  }

  const fullName =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? "New User";

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      role: user.user_metadata?.role ?? "club",
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("Error ensuring user profile:", error);
    throw new Error(error.message || "Unable to prepare user profile for proposal creation");
  }
};

const handleCreateEvent = async ({ title, description, date, participants }) => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching logged-in user:", userError);
      throw new Error(userError.message || "Unable to verify current user");
    }

    if (!user) {
      throw new Error("You must be logged in to create an event");
    }

    await ensureUserProfile(user);

    const payload = {
      title,
      description,
      date,
      participants,
      status: "pending_hod",
      created_by: user.id,
      // Keep compatibility with existing user-scoped queries.
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("proposal")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Error inserting proposal:", error);
      throw new Error(error.message || "Failed to create proposal");
    }

    return {
      data,
      message: "Event created successfully",
    };
  } catch (error) {
    console.error("handleCreateEvent failed:", error);
    throw error;
  }
};

const createProposal = async (proposal) => handleCreateEvent(proposal);

const getProposals = async (userId) => {
  const { data, error } = await supabase
    .from("proposal")
    .select("id, title, description, date, participants, status, hod_comment, principal_comment, admin_comment, created_by, user_id")
    .or(`created_by.eq.${userId},user_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

const deleteProposal = async (id) => {
  const { error } = await supabase
    .from("proposal")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
};

const approveEvent = async (id) => {
  try {
    const { data, error } = await supabase
      .from("proposal")
      .update({ status: "approved_hod" })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error approving event ${id}:`, error);
      throw new Error(error.message || "Failed to approve event");
    }

    console.log(`Event ${id} approved successfully.`);
    return data;
  } catch (err) {
    console.error("approveEvent failed:", err);
    throw err;
  }
};

const rejectEvent = async (id, comment) => {
  try {
    const { data, error } = await supabase
      .from("proposal")
      .update({ status: "rejected_hod", hod_comment: comment })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error rejecting event ${id}:`, error);
      throw new Error(error.message || "Failed to reject event");
    }

    console.log(`Event ${id} rejected successfully.`);
    return data;
  } catch (err) {
    console.error("rejectEvent failed:", err);
    throw err;
  }
};

const fetchPendingEvents = async () => {
  try {
    const { data, error } = await supabase
      .from("proposal")
      .select("id, title, description, date, participants, status")
      .eq("status", "pending_hod")
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching pending HOD events:", error);
      throw new Error(error.message || "Failed to fetch pending events");
    }

    return data ?? [];
  } catch (err) {
    console.error("fetchPendingEvents failed:", err);
    throw err;
  }
};

export const updateProposal = async (id, updatedData) => {
  const { error } = await supabase
    .from("proposal")
    .update(updatedData)
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
};

export {
  createProposal,
  handleCreateEvent,
  getProposals,
  deleteProposal,
  approveEvent,
  rejectEvent,
  fetchPendingEvents,
};