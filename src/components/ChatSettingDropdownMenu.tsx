import React, { Fragment, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, PencilIcon, InformationCircleIcon,
  PencilSquareIcon, Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { ChatSettings } from '../models/ChatSettings';
import ChatSettingsForm from './ChatSettingsForm';

interface ChatSettingDropdownMenuProps {
  chatSetting: ChatSettings | undefined;
  className?: string;
}

const ChatSettingDropdownMenu: React.FC<ChatSettingDropdownMenuProps> = ({
                                                                           chatSetting,
                                                                           className,
                                                                         }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Fragment>
      <div className={`inline-block relative text-left ${className}`}>
        <Menu as="div">
          {({ open }) => (
            <>
              <Menu.Button className="inline-flex px-3 py-2 text-md font-medium text-gray-700 bg-white rounded-md shadow-sm hover:bg-gray-50 focus:outline-none items-center">
                <span>{chatSetting ? chatSetting.name : 'Chat'}</span>
                <ChevronDownIcon
                  className={`${open ? 'transform rotate-180' : ''} w-5 h-5`}
                  aria-hidden="true"
                />
              </Menu.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Menu.Items className="absolute left-0 w-56 mt-2 origin-top-left bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none z-20">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          onClick={() => navigate(`/g/${chatSetting?.id}`)}
                          className={`flex items-center px-4 py-2 text-sm ${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          <PencilSquareIcon
                            className="w-4 h-4 mr-3"
                            aria-hidden="true"
                          />
                          New chat
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setIsDialogOpen(true)}
                          className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          <InformationCircleIcon
                            className="w-4 h-4 mr-3"
                            aria-hidden="true"
                          />
                          About
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          className={`flex items-center px-4 py-2 text-sm ${
                            chatSetting?.author === 'system'
                              ? 'text-gray-400'
                              : active
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700'
                          }`}
                          aria-disabled={chatSetting?.author === 'system'}
                        >
                          <Cog6ToothIcon
                            className="w-4 h-4 mr-3"
                            aria-hidden="true"
                          />
                          Edit
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={`flex items-center px-4 py-2 text-sm ${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          <PencilIcon
                            className="collapse w-4 h-4 mr-3"
                            aria-hidden="true"
                          />
                          Hide from sidebar
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      </div>
      <Transition.Root show={isDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsDialogOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="absolute top-4 right-4">
                    <button
                      type="button"
                      className="inline-flex justify-center p-2 text-gray-400 hover:text-gray-500"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-2">
                    <ChatSettingsForm readOnly={true} chatSettings={chatSetting} />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </Fragment>
  );
};

export default ChatSettingDropdownMenu;
