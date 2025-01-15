const Footer = () => {
  return (
    <div className="w-full bg-white text-black pt-20">
      <div className="bg-white text-black w-4/5 px-4  mx-auto">
        <div className="border-b-2 pb-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Join our newsletter</h1>
            <h5 className="text-sm text-gray-600">
              Keep up to date with everything Reflect
            </h5>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="email"
              placeholder="Enter your Email"
              className="px-4 py-2 border rounded-lg w-full"
            />
            <button role="button" className="btn btn-primary">
              Subscribe
            </button>
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <div className="flex gap-6">
            <h6 className="hover:text-blue-500 cursor-pointer">
              Privacy Policy
            </h6>
            <h6>-</h6>
            <h6 className="hover:text-blue-500 cursor-pointer">
              Terms of Conditions
            </h6>
          </div>
          <div className="text-sm">All rights reserved</div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
