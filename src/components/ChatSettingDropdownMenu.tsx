import React, { Fragment, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, PencilIcon, InformationCircleIcon,
  PencilSquareIcon, Cog6ToothIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { ChatSettings } from '../models/ChatSettings';
import ChatSettingsForm from './ChatSettingsForm';
import {useTranslation} from 'react-i18next';
import chatSettingsDB from "../service/ChatSettingsDB";
import ChatSettingsDB from '../service/ChatSettingsDB';
import {NotificationService} from "../service/NotificationService";

interface ChatSettingDropdownMenuProps {
  chatSetting: ChatSettings | undefined;
  showTitle?: boolean;
  className?: string;
}

const ChatSettingDropdownMenu: React.FC<ChatSettingDropdownMenuProps> = ({
                                                                           chatSetting,
                                                                           showTitle = true,
                                                                           className,
                                                                         }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const {t} = useTranslation();


  const onAbout = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    setIsDialogOpen(true);
  }

  const onEdit = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    navigate('/custom/editor/'+chatSetting?.id)
  }

  const onDelete = async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (chatSetting) {
      await ChatSettingsDB.chatSettings.delete(chatSetting.id);
      NotificationService.handleSuccess('Custom Chat '+chatSetting.name+' deleted.');
      navigate('/explore');
    }
  }

  return (
      <Fragment>
          <div className={`inline-block relative text-left ${className}`} onClick={(event) => event.stopPropagation()}>
              <Menu as="div">
                  {({ open }) => (
                      <>
                          <Menu.Button className="inline-flex px-3 py-2 text-md font-medium text-gray-700 bg-white dark:text-gray-200 dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none items-center">
                              <span>{showTitle && chatSetting ? chatSetting.name : ''}</span>
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
                              <Menu.Items className="absolute left-0 w-56 mt-2 origin-top-left bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 divide-y divide-gray-100 dark:divide-gray-600 rounded-md shadow-lg outline-none z-20">
                                  <div className="py-1">
                                      <Menu.Item>
                                          {({ active }) => (
                                              <a
                                                  onClick={() => navigate(`/g/${chatSetting?.id}`)}
                                                  className={`flex items-center px-4 py-2 text-sm ${
                                                      active ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                                  }`}
                                              >
                                                  <PencilSquareIcon
                                                      className="w-4 h-4 mr-3"
                                                      aria-hidden="true"
                                                  />
                                                  {t('new-chat')}
                                              </a>
                                          )}
                                      </Menu.Item>
                                      <Menu.Item>
                                          {({ active }) => (
                                              <button
                                                  onClick={(event) => onAbout(event)}
                                                  className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                                                      active ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                                  }`}
                                              >
                                                  <InformationCircleIcon
                                                      className="w-4 h-4 mr-3"
                                                      aria-hidden="true"
                                                  />
                                                  {t('menu-about')}
                                              </button>
                                          )}
                                      </Menu.Item>
                                      <Menu.Item>
                                          {({ active }) => (
                                              <a
                                                  onClick={(event) => onEdit(event)}
                                                  className={`flex items-center px-4 py-2 text-sm ${
                                                      chatSetting?.author === 'system'
                                                          ? 'text-gray-400 dark:text-gray-500'
                                                          : active
                                                              ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'
                                                              : 'text-gray-700 dark:text-gray-300'
                                                  }`}
                                                  aria-disabled={chatSetting?.author === 'system'}
                                              >
                                                  <Cog6ToothIcon
                                                      className="w-4 h-4 mr-3"
                                                      aria-hidden="true"
                                                  />
                                                  {t('menu-edit')}
                                              </a>
                                          )}
                                      </Menu.Item>
                                    {/*  <Menu.Item>
                                          {({ active }) => (
                                              <a
                                                  href="#"
                                                  className={`flex items-center px-4 py-2 text-sm ${
                                                      active ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                                  }`}
                                              >
                                                  <PencilIcon
                                                      className="collapse w-4 h-4 mr-3"
                                                      aria-hidden="true"
                                                  />
                                                  {t('hide-sidebar')}
                                              </a>
                                          )}
                                      </Menu.Item>*/}
                                    <Menu.Item>
                                      {({ active }) => (
                                        <a
                                          onClick={(event) => onDelete(event)}
                                          href="#"
                                          className={`flex items-center px-4 py-2 text-sm ${
                                            chatSetting?.author === 'system'
                                              ? 'text-gray-400 dark:text-gray-500'
                                              : active
                                                ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'
                                                : 'text-gray-700 dark:text-gray-300'
                                          }`}
                                          aria-disabled={chatSetting?.author === 'system'}
                                        >
                                          <TrashIcon
                                            className="collapse w-4 h-4 mr-3"
                                            aria-hidden="true"
                                          />
                                          {t('menu-delete')}
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
                      <div
                          className="flex min-h-full items-start justify-center p-4 text-center"
                          style={{ marginTop: '5vh' }}
                      >
                          <Transition.Child
                              as={Fragment}
                              enter="ease-out duration-300"
                              enterFrom="opacity-0 scale-95"
                              enterTo="opacity-100 scale-100"
                              leave="ease-in duration-200"
                              leaveFrom="opacity-100 scale-100"
                              leaveTo="opacity-0 scale-95"
                          >
                              <Dialog.Panel className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                  <div className="absolute top-4 right-4">
                                      <button
                                          type="button"
                                          className="inline-flex justify-center p-2 text-gray-400 hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-400"
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
