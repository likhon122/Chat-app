import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSendSupportMessageMutation } from "../../app/api/api";

const HomePage = () => {
  const userData = useSelector((state) => state.auth.user);
  // const [hasScrolled, setHasScrolled] = useState(false);

  // Initialize animation controls
  const heroControls = useAnimation();
  const featuresControls = useAnimation();
  const testimonialsControls = useAnimation();
  const ctaControls = useAnimation();
  const contactControls = useAnimation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [sendSupportMessage, { isLoading }] = useSendSupportMessageMutation();

  // Function to handle scroll event and trigger animations
  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight;

    const heroElement = document.getElementById("hero");
    const featuresElement = document.getElementById("features");
    const testimonialsElement = document.getElementById("testimonials");
    const ctaElement = document.getElementById("get-started");
    const contactElement = document.getElementById("contact");

    if (heroElement) {
      const heroTop = heroElement.offsetTop;
      if (scrollPosition > heroTop) {
        heroControls.start({ opacity: 1, y: 0 });
        // setHasScrolled(true);
      } else {
        heroControls.start({ opacity: 0, y: 50 });
      }
    }

    if (featuresElement) {
      const featuresTop = featuresElement.offsetTop;
      if (scrollPosition > featuresTop) {
        featuresControls.start({ opacity: 1, y: 0 });
      } else {
        featuresControls.start({ opacity: 0, y: 50 });
      }
    }

    if (testimonialsElement) {
      const testimonialsTop = testimonialsElement.offsetTop;
      if (scrollPosition > testimonialsTop) {
        testimonialsControls.start({ opacity: 1, y: 0 });
      } else {
        testimonialsControls.start({ opacity: 0, y: 50 });
      }
    }

    if (ctaElement) {
      const ctaTop = ctaElement.offsetTop;
      if (scrollPosition > ctaTop) {
        ctaControls.start({ opacity: 1, y: 0 });
      } else {
        ctaControls.start({ opacity: 0, y: 50 });
      }
    }

    if (contactElement) {
      const contactTop = contactElement.offsetTop;
      if (scrollPosition > contactTop) {
        contactControls.start({ opacity: 1, y: 0 });
      } else {
        contactControls.start({ opacity: 0, y: 50 });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setEmail("");
    setName("");

    try {
      await sendSupportMessage({
        name,
        email,
        message
      });

      toast.success(
        "Message Sent Successfully! Our support team will contact you soon.",
        {
          isLoading: false,
          autoClose: 3000,
          closeButton: true
        }
      );
    } catch (error) {
      toast.error(error.data?.errorMessage || "Something went wrong!!");
    }
  };

  useEffect(() => {
    if (userData) {
      navigate("/chat");
    }
  }, [userData, navigate]);

  // Attach scroll event listener on component mount
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger scroll handling immediately to set initial state
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="font-sans antialiased bg-gray-100 dark:bg-[#181818]  text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section
        id="hero"
        className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-[#181818]   text-gray-900 dark:text-gray-100"
      >
        <motion.div
          className="text-center p-8 md:p-16 lg:px-24"
          initial={{ opacity: 1, y: 0 }} // Ensure initial visibility
          animate={heroControls}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Welcome to ChatApp
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto">
            Connect instantly with friends and colleagues. Enjoy seamless
            communication and stay in touch with ease.
          </p>
          <Link to={"/sign-up"}>
            <button className="bg-yellow-500 dark:bg-yellow-400 text-gray-900 dark:text-gray-900 text-lg md:text-xl py-4 px-8 rounded-full shadow-lg hover:bg-yellow-600 dark:hover:bg-yellow-300 transition duration-300 ease-in-out transform hover:scale-105">
              Get Started
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800 " id="features">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0 }}
            animate={featuresControls}
            transition={{ duration: 1 }}
          >
            Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {["Real-time Messaging", "File Sharing", "Group Chats"].map(
              (feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg"
                  initial={{ opacity: 0, y: 50 }}
                  animate={featuresControls}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <h3 className="text-2xl font-semibold mb-4">{feature}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {`Description for ${feature}.`}
                  </p>
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white dark:bg-gray-900" id="testimonials">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0 }}
            animate={testimonialsControls}
            transition={{ duration: 1 }}
          >
            What Our Users Say
          </motion.h2>
          <div className="flex flex-wrap justify-center">
            {[
              {
                text: "ChatApp has revolutionized the way I stay in touch with my team. It’s fast, reliable, and easy to use.",
                name: "Jane Doe"
              },
              {
                text: "The group chat feature is fantastic for managing projects. I love how seamless the experience is.",
                name: "John Smith"
              },
              {
                text: "File sharing is a breeze with ChatApp. I can send documents and images in no time!",
                name: "Emily Johnson"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm mx-4 mb-8"
                initial={{ opacity: 0, y: 50 }}
                animate={testimonialsControls}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  “{testimonial.text}”
                </p>
                <p className="font-semibold">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section
        className="py-16 bg-blue-600 dark:bg-blue-800 text-white text-center"
        id="get-started"
      >
        <motion.div
          className="container mx-auto px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={ctaControls}
          transition={{ duration: 1 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl mb-8">
            Join millions of users who are already enjoying seamless
            communication with ChatApp.
          </p>
          <Link to={"/sign-up"}>
            <button className="bg-yellow-500 dark:bg-yellow-400 text-gray-900 dark:text-gray-900 text-lg py-3 px-6 rounded-lg shadow-lg hover:bg-yellow-600 dark:hover:bg-yellow-300 transition duration-300 ease-in-out">
              Sign Up Now
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-100 dark:bg-[#181818] " id="contact">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0 }}
            animate={contactControls}
            transition={{ duration: 1 }}
          >
            Contact Us
          </motion.h2>
          <div className="max-w-md mx-auto bg-white dark:bg-[#2B2B2B] p-8 rounded-lg shadow-lg">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-gray-700 dark:text-gray-300 font-semibold mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  name="name"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-[#3A3B3C] dark:text-white dark:border-[#444] dark:focus:ring-purple-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 dark:text-gray-300 font-semibold mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-[#3A3B3C] dark:text-white dark:border-[#444] dark:focus:ring-purple-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="message"
                  className="block text-gray-700 dark:text-gray-300 font-semibold mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-[#3A3B3C] dark:text-white dark:border-[#444] dark:focus:ring-purple-500"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-2 my-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 dark:bg-purple-600 dark:hover:bg-purple-500 transition duration-300"
              >
                {isLoading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
