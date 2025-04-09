import React from 'react';
import { FaPhilosophyIcon } from 'react-icons/fa';
import { IoMdTimer } from 'react-icons/io';
import { BsFillQuestionCircleFill } from 'react-icons/bs';

export const IconExample: React.FC = () => {
    return (
        <div className="flex gap-4 items-center">
            <FaPhilosophyIcon size={24} className="text-blue-600" />
            <IoMdTimer size={24} className="text-red-600" />
            <BsFillQuestionCircleFill size={24} className="text-green-600" />
        </div>
    );
};