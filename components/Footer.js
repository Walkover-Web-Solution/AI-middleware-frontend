const Footer = () => {
  return (
    <div className=" w-4/5 px-4  mx-auto mt-20 pb-10">
      <div className="border-b-2 pb-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Join our newsletter</h1>
          <h5 className="text-sm text-gray-600">
            Keep up to date with everything Reflect
          </h5>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Enter your Email"
            className="input input-bordered w-full max-w-xs text-black"
          />

          <button role="button" className="btn btn-primary">
            Subscribe
          </button>
        </div>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <div className="flex gap-6">
          <h6 className="hover:text-blue-500 cursor-pointer">Privacy Policy</h6>
          <h6>-</h6>
          <h6 className="hover:text-blue-500 cursor-pointer">
            Terms of Conditions
          </h6>
        </div>
        <div className="text-sm">All rights reserved</div>
      </div>
    </div>
  );
};

export default Footer;
