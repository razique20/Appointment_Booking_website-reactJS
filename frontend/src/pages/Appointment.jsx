import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import RelatedDoctors from "../components/RelatedDoctors";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const[slotTime,setSlotTime] = useState(null)

  const fetchDocInfo = async () => {
    setLoading(true);
    try {
      const docInfo = doctors.find((doc) => doc._id === docId);
      setDocInfo(docInfo);
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSlot = async () => {
    setDocSlots([]);
    setLoading(true);
    
    try {
      let today = new Date();
      let slots = [];

      for (let i = 0; i < 7; i++) {
        let currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        let endTime = new Date(today);
        endTime.setDate(today.getDate() + i);
        endTime.setHours(21, 0, 0, 0);

        if (today.getDate() === currentDate.getDate()) {
          currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
          currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
        } else {
          currentDate.setHours(10);
          currentDate.setMinutes(0);
        }

        let timeSlots = [];
        while (currentDate < endTime) {
          let formattedTime = currentDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });

          currentDate.setMinutes(currentDate.getMinutes() + 30);
        }

        slots.push(timeSlots);
      }

      setDocSlots(slots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlot();
    }
  }, [docInfo]);

  useEffect(() => {
    console.log(docSlots)
  },[docInfo])

  if (loading) return <p>Loading...</p>;

  return (
    docInfo && (
      <div>
        <div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <img
                className="bg-primary w-full sm:max-w-72 rounded-lg"
                src={docInfo.image}
                alt={`${docInfo.name}'s profile`}
              />
            </div>
            <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
              <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
                {docInfo.name}{" "}
                <img className="w-5" src={assets.verified_icon} alt="Verified Icon" />
              </p>
              <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
                <p>
                  {docInfo.degree} - {docInfo.speciality}
                </p>
                <button className="py-0.5 px-2 border text-xs rounded-full">
                  {docInfo.experience}
                </button>
              </div>
              <div>
                <p className="flex items-center gap-1 text-sm font-medium text-gray-900">
                  About <img src={assets.info_icon} alt="Info Icon" />
                </p>
                <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                  {docInfo.about}
                </p>
              </div>
              <p className="text-gray-500 font-medium mt-4">
                Appointment fee:{" "}
                <span className="text-gray-600">
                  {currencySymbol}
                  {docInfo.fees}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll">
            {docSlots.length && (
              docSlots.map((slots, index) => {
                const currentDay = (new Date().getDay() + index) % 7;
                return (
                  <div
                    className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                      slotIndex === index ? "bg-primary text-white" : "border border-gray-200"
                    }`}
                    key={index}
                    onClick={() => setSlotIndex(index)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${daysOfWeek[currentDay]}`}
                  >
                    <p>{daysOfWeek[currentDay]}</p>
                    <p>{slots[0] && slots[0].datetime.getDate()}</p>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
            {docSlots.length && docSlots[slotIndex].map((item,index) => (
              <p onClick={()=> setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border-gray-400'}`} key={index}>
                {item.time.toLowerCase()}
              </p>

            ))}
          </div>
          <button className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6">Book an appointment</button>
        </div>

        <RelatedDoctors docId={docId} speciality={docInfo.speciality}/>
      </div>
    )
  );
};

export default Appointment;
