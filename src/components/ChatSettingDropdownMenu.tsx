import React from 'react';
import { Menu } from '@headlessui/react';
import { ChatSettings } from '../models/ChatSettings';
import {ChevronDownIcon, PencilIcon, InformationCircleIcon, PencilSquareIcon} from '@heroicons/react/24/outline';

interface ChatSettingDropdownMenuProps {
  chatSetting: ChatSettings | undefined;
  className?: string;
}

const ChatSettingDropdownMenu: React.FC<ChatSettingDropdownMenuProps> = ({ chatSetting, className }) => {
  return (
    <div className={`inline-block relative text-left ${className}`}>
      <Menu as="div">
        {({ open }) => (
          <>
            <Menu.Button
              className="inline-flex justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 items-center">
              <span className="font-bold text-lg">{chatSetting ? chatSetting.name : 'Chat'}</span>
              <ChevronDownIcon
                className={`${open ? 'transform rotate-180' : ''} w-5 h-5`}
                aria-hidden="true"
              />
            </Menu.Button>
            {open && (
              <Menu.Items
                static
                className="absolute left-0 w-56 mt-2 origin-top-left bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none"
              >
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={`flex items-center ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm`}
                      >
                        <PencilSquareIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                        New chat
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={`flex items-center ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm`}
                      >
                        <InformationCircleIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                        About
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={`flex items-center ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm`}
                      >
                        <PencilIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                        Edit
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={`flex items-center ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm`}
                      >
                        {/*todo: find icon*/}
                        <PencilIcon className="collapse w-4 h-4 mr-3" aria-hidden="true" />
                        Hide from sidebar
                      </a>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            )}
          </>
        )}
      </Menu>
    </div>
  );
};

export default ChatSettingDropdownMenu;
