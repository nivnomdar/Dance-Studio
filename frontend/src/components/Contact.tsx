import { useState } from "react";
// import { toast } from "react-hot-toast";

function Contact() {
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
  });

  // const handleChange = (e: any) => {
  //   const { fullName, phone } = e.target;
  //   setFormData({
  //     ...formData,
  //     [fullName]: value,
  //   });
  // };

  // const handleSubmit = async (e: any) => {
  //   console.log("Submitted");
  //   e.preventDefault();
  //   setSending(true);

  //   const data = {
  //     fullName: e.target.fullName.value,
  //     phone: e.target.phone.value,
  //   };
  //   JSONdata = JSON.stringify(data);
  //   const endpoint = "/api/send";

  //   const options = {
  //     // The method is POST because we are sending data.
  //     method: "POST",
  //     // Tell the server we're sending JSON.
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     // Body of the request is the JSON data we created above.
  //     body: JSONdata,
  //   };

  //   const response = await fetch(endpoint, options);
  //   const resData = await response.json();

  //   if (response.status === 200) {
  //     setSending(false);
  //     setEmailSubmitted(true);
  //     toast.success("Message sent, Thank you!");

  //     setFormData({
  //       email: "",
  //       subject: "",
  //       message: "",
  //     });
  //   } else {
  //     toast.error("Something went wrong! Please try again.");
  //   }
  // };

  return (
    <div className="my-35 py-10 gap-4 relative mx-6">
      <div className="z-10">
        <h5 className="text-xl font-bold text-white">לפרטים נוספים</h5>
        <p className="text-[#ADB7BE] mb-2 max-w-md">
          השאירי פרטים ואדאג ליצור איתך קשר:
        </p>
      </div>

      <div>
        <form
          className="flex flex-col"
          // onSubmit={handleSubmit}
        >
          <div className="mb-3">
            <label
              htmlFor="fullName"
              className="text-white block mb-2 text-sm font-medium">
              שם מלא
            </label>
            <input
              name="fullName"
              type="text"
              id="fullName"
              required
              value={formData.fullName}
              // onChange={handleChange}
              // placeholder="שם פרטי ושם משפחה"
              className="bg-[#18191E] border placeholder-[#9CA2A9] text-gray-100 text-sm rounded-lg block w-full p-2.5"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="phone"
              className="text-white block text-sm mb-2 font-medium">
              מספר פלאפון
            </label>
            <input
              name="phone"
              id="phone"
              value={formData.phone}
              // onChange={handleChange}
              className="bg-[#18191E] border border-orange-500 placeholder-[#9CA2A9] text-gray-100 text-sm rounded-lg block w-full p-2.5"
              // placeholder=""
            />
          </div>
          <button
            type="submit"
            className="bg-[#b9dd38] text-white font-medium py-2.5 px-5 rounded-lg w-full">
            שליחה
          </button>
        </form>
      </div>
    </div>
  );
  // לפרטים נוספים, השאירי פרטים ואדאג לחזור ליצור איתך קשר:
}

export default Contact;
