import { useState } from "react";
// import { toast } from "react-hot-toast";

function Contact() {
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // כאן נוסיף את הלוגיקה לשליחת הטופס
    console.log("Form submitted:", formData);
    setSending(false);
  };

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
    <div className="min-h-screen bg-[#0a0a0a] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h5 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4">
              לפרטים נוספים
            </h5>
            <p className="text-[#ADB7BE] text-sm sm:text-base">
              השאירי פרטים ואדאג ליצור איתך קשר:
            </p>
          </div>

          <div className="bg-[#18191E] rounded-xl p-6 sm:p-8 shadow-lg">
            <form className="flex flex-col" onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="fullName"
                  className="text-white block mb-2 text-sm sm:text-base font-medium">
                  שם מלא
                </label>
                <input
                  name="fullName"
                  type="text"
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="bg-[#0a0a0a] border border-gray-700 text-gray-100 text-sm sm:text-base rounded-lg block w-full p-3 focus:ring-2 focus:ring-[#b9dd38] focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="mb-8">
                <label
                  htmlFor="phone"
                  className="text-white block text-sm sm:text-base mb-2 font-medium">
                  מספר פלאפון
                </label>
                <input
                  name="phone"
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-[#0a0a0a] border border-gray-700 text-gray-100 text-sm sm:text-base rounded-lg block w-full p-3 focus:ring-2 focus:ring-[#b9dd38] focus:border-transparent transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="bg-[#b9dd38] text-white font-medium py-3 px-6 rounded-lg w-full text-sm sm:text-base hover:bg-[#a8c832] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {sending ? 'שולח...' : 'שליחה'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
  // לפרטים נוספים, השאירי פרטים ואדאג לחזור ליצור איתך קשר:
}

export default Contact;
