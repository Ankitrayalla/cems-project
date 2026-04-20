import { useForm } from "react-hook-form";
import { createProposal } from "../services/proposals";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext"; 
function CreateProposal() {
    const { user } = useContext(AuthContext);

const onSubmit = async (data) => {
  try {
    await createProposal({
      ...data,
    });

    alert("Proposal submitted successfully!");
  } catch (err) {
    console.error(err);
    alert("Error submitting proposal");
  }
};

  const { register, handleSubmit } = useForm();
  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <h1 className="mb-6 text-2xl font-bold">Create Event Proposal</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <input
          {...register("title")}
          placeholder="Event Title"
          className="w-full p-2 rounded text-black"
        />

        <textarea
          {...register("description")}
          placeholder="Event Description"
          className="w-full p-2 rounded text-black"
          rows={1}
          style={{ verticalAlign: "middle", height: "38px", resize: "none" }}
        />

        <input
          type="date"
          {...register("date")}
          className="w-full p-2 rounded text-black"
        />

        <input
          type="number"
          {...register("participants")}
          placeholder="Expected Participants"
          className="w-full p-2 rounded text-black"
        />

        <button className="bg-blue-600 px-4 py-2 rounded">
          Submit Proposal
        </button>
      </form>
    </div>
  );
  
}

export default CreateProposal;