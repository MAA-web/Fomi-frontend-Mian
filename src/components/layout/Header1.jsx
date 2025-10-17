import React from "react";
import x10 from "./10.png";
import group173 from "./group-173.png";
import image2 from "./image-2.png";
import image from "./image.png";
import notificationButton from "./notification-button.png";
import profileImage from "./profile-image.png";

export const Header1 = () => {
  return (
    <div className="w-[1492px] h-[57px]">
      <header className="fixed top-[-2451px] left-[971px] w-[1492px] h-[57px] flex bg-transparent">
        <img className="mt-3 w-[21px] h-[34px]" alt="Element" src={x10} />

        <div className="w-[456px] h-[57px] relative ml-[496px]">
          <div className="w-full h-[29.82%] top-0 bg-[#f9f3f0] rounded-[34px] absolute left-0" />

          <div className="w-[14.69%] h-[19.30%] top-[5.26%] bg-[#ffd9c7] rounded-[10px] absolute left-0" />

          <div className="absolute h-[18px] top-[31px] left-[25px] flex items-start min-w-[305px]">
            <div className="w-[19px] h-[17px] self-end bg-[url(/icons.svg)] bg-[100%_100%]" />

            <div className="w-[17px] h-4 ml-[76px] bg-[url(/vector.svg)] bg-[100%_100%]" />

            <div className="w-[23px] h-[13px] self-center ml-[74px] mt-[0.95px] bg-[url(/image.svg)] bg-[100%_100%]" />

            <img
              className="w-3.5 h-[15px] ml-[82px]"
              alt="Group"
              src={group173}
            />
          </div>

          <div className="absolute w-[3.29%] h-[23.39%] top-[54.39%] left-[91.45%] bg-[url(/vector-2.svg)] bg-[100%_100%]" />
        </div>

        <div className="mt-3.5 w-[247px] h-[29px] relative ml-[272px]">
          <div className="absolute right-[167px] bottom-0 w-20 h-[29px]">
            <div className="w-[78px] absolute right-0.5 bottom-0 h-[29px] bg-[#fcf7f5] rounded-[7.25px] border border-solid border-[#f4f3ee]" />

            <div className="absolute right-2.5 bottom-2 w-[39px] h-[15px] flex items-center justify-center [font-family:'Inter-Regular',Helvetica] font-normal text-[#858585] text-[11.3px] tracking-[0] leading-[normal]">
              Gallery
            </div>

            <img
              className="right-[54px] bottom-[7px] w-[15px] h-[15px] absolute object-cover"
              alt="Image"
              src={image}
            />
          </div>

          <img
            className="absolute w-[29px] h-[29px] top-0 left-[182px]"
            alt="Notification button"
            src={notificationButton}
          />

          <div className="absolute top-0 left-[218px] w-[29px] h-[29px] flex bg-[#fcf7f5] rounded-[9px]">
            <img
              className="mt-[3.1px] w-[22.79px] h-[22.79px] ml-[3.1px]"
              alt="Profile image"
              src={profileImage}
            />
          </div>

          <div className="absolute right-[70px] bottom-0 w-[84px] h-[29px]">
            <div className="w-[82px] absolute right-0.5 bottom-0 h-[29px] bg-[#fcf7f5] rounded-[7.25px] border border-solid border-[#f4f3ee]" />

            <div className="absolute right-2.5 bottom-2 w-11 h-4 flex items-center justify-center [font-family:'Inter-Regular',Helvetica] font-normal text-[#858585] text-[11px] tracking-[0] leading-[normal]">
              Support
            </div>

            <img
              className="right-[60px] bottom-2 w-3.5 h-3.5 absolute object-cover"
              alt="Image"
              src={image2}
            />
          </div>
        </div>
      </header>
    </div>
  );
};
