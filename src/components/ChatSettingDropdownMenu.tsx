import React, {Fragment, useState} from 'react';
import {Dialog, Menu, Transition} from '@headlessui/react';
import {
  ChevronDownIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {useNavigate} from 'react-router-dom';
import {ChatSettings} from '../models/ChatSettings';
import ChatSettingsForm from './ChatSettingsForm';
import {useTranslation} from 'react-i18next';
import {deleteChatSetting, updateShowInSidebar} from '../service/ChatSettingsDB';
import {NotificationService} from "../service/NotificationService";
import ConversationService from '../service/ConversationService';
import {useConfirmDialog} from "./ConfirmDialog";

interface ChatSettingDropdownMenuProps {
  chatSetting: ChatSettings | undefined;
  showTitle?: boolean;
  showDelete?: boolean;
  className?: string;
  alignRight?: boolean;
}

const ChatSettingDropdownMenu: React.FC<ChatSettingDropdownMenuProps> = ({
                                                                           chatSetting,
                                                                           showTitle = true,
                                                                           showDelete = false,
                                                                           className,
                                                                           alignRight = false,
                                                                         }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {showConfirmDialog, ConfirmDialog} = useConfirmDialog();
  const navigate = useNavigate();
  const {t} = useTranslation();



  const onAbout = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    setIsDialogOpen(true);
  }

  const onEdit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    navigate('/custom/editor/' + chatSetting?.id)
  }

  const onDuplicate = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    if (chatSetting) {
      const newChatSetting = {...chatSetting, id: 0, name: `${chatSetting.name} (Copy)`, author: 'user'};
      navigate('/custom/editor/', {state: {initialChatSetting: newChatSetting}});
    }
  }

  const performDeleteChatSetting = async (gid: number) => {
    try {
      if (gid > 0) {
        try {
          await ConversationService.deleteConversationsByGid(gid);
        } catch (error) {
          console.error('Failed to delete related conversations:', error);
          NotificationService.handleError('Failed to delete related conversations. Please try again.');
          return;
        }
      }

      try {
        await deleteChatSetting(gid);
      } catch (error) {
        console.error('Failed to delete chat setting:', error);
        NotificationService.handleError('Failed to delete chat setting. Please try again.');
      }
    } catch (error) {
      console.error('Error during deletion process::', error);
      if (error instanceof Error) {
        NotificationService.handleUnexpectedError(error, "Failed to delete all conversations");
      } else {
        NotificationService.handleUnexpectedError(new Error('An unknown error occurred'), "Failed to delete all conversations");
      }
    }
  }

  const onDelete = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    if (chatSetting) {
      const gid = chatSetting.id;
      const conversationCount = await ConversationService.countConversationsByGid(gid);

      if (conversationCount > 0 && gid > 0) {
        showConfirmDialog({
          message: `Deleting this chat setting will also delete ${conversationCount} conversations associated with it. Do you want to proceed?`,
          confirmText: 'Delete',
          confirmButtonVariant: 'critical',
          onConfirm: async () => {
            await performDeleteChatSetting(gid);
          },
        })
      } else {
        performDeleteChatSetting(gid);
      }
    }
  }


  const onHideFromSidebar = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    if (chatSetting) {
      await updateShowInSidebar(chatSetting.id, 0);
    }
  }

  const toggleInSidebar = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    if (chatSetting) {
      const newShowInSidebar = chatSetting.showInSidebar === 1 ? 0 : 1;
      await updateShowInSidebar(chatSetting.id, newShowInSidebar);
    }
  }

  const menuItemsClass = `absolute ${alignRight ? 'right-0' : 'left-0'} w-56 mt-2 origin-top-left bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 divide-y divide-gray-100 dark:divide-gray-600 rounded-md shadow-lg outline-none z-20`;

  return (
      <Fragment>
        <div className={`inline-block relative text-left ${className}`}
             onClick={(event) => event.stopPropagation()}>
          <Menu as="div">
            {({open}) => (
                <>
                  <Menu.Button
                      style={{ paddingTop: '.625rem', paddingBottom: '.625rem' }}
                      className="inline-flex px-3 text-md font-medium text-gray-700 bg-white dark:text-gray-200 dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none items-center">
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
                    <Menu.Items
                        className={menuItemsClass}>
                      <div className="py-1">
                        <Menu.Item>
                          {({active}) => (
                              <button
                                  onClick={() => navigate(`/g/${chatSetting?.id}`, {state: {reset: Date.now()}})}
                                  className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                                      active ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                  }`}
                              >
                                <PencilSquareIcon
                                    className="w-4 h-4 mr-3"
                                    aria-hidden="true"
                                />
                                {t('new-chat')}
                              </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({active}) => (
                              <button
                                  onClick={onAbout}
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
                          {({active}) => (
                              <button
                                  onClick={onEdit}
                                  disabled={chatSetting?.author === 'system'}
                                  className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                                      chatSetting?.author === 'system'
                                          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
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
                              </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({active}) => (
                              <button
                                  onClick={onDuplicate}
                                  className={`flex items-center w-full px-4 py-2 text-sm ${
                                      active
                                          ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'
                                          : 'text-gray-700 dark:text-gray-300'
                                  }`}
                              >
                                <DocumentDuplicateIcon
                                    className="w-4 h-4 mr-3"
                                    aria-hidden="true"
                                />
                                {t('menu-duplicate')}
                              </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({active}) => (
                              <button
                                  onClick={toggleInSidebar}
                                  className={`flex items-center w-full px-4 py-2 text-sm ${
                                      active ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                  }`}
                              >
                                {chatSetting?.showInSidebar === 1 ? (
                                    <EyeSlashIcon className="w-4 h-4 mr-3" aria-hidden="true"/>
                                ) : (
                                    <EyeIcon className="w-4 h-4 mr-3" aria-hidden="true"/>
                                )}
                                {chatSetting?.showInSidebar === 1 ? t('hide-sidebar') : t('show-sidebar')}
                              </button>
                          )}
                        </Menu.Item>
                        {showDelete && (
                            <Menu.Item>
                              {({active}) => (
                                  <button
                                      onClick={onDelete}
                                      disabled={chatSetting?.author === 'system'}
                                      className={`flex items-center w-full px-4 py-2 text-sm ${
                                          chatSetting?.author === 'system'
                                              ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                              : active
                                                  ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'
                                                  : 'text-gray-700 dark:text-gray-300'
                                      }`}
                                  >
                                    <TrashIcon
                                        className="w-4 h-4 mr-3"
                                        aria-hidden="true"
                                    />
                                    {t('menu-delete')}
                                  </button>
                              )}
                            </Menu.Item>
                        )}
                      </div>
                    </Menu.Items>
                  </Transition>
                </>
            )}
          </Menu>
        </div>
        {ConfirmDialog}
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
              <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"/>
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div
                  className="flex min-h-full items-start justify-center p-4 text-center"
                  style={{marginTop: '5vh'}}
                  onClick={(event) => {
                    // This prevents the backdrop click from propagating.
                    event.stopPropagation();
                  }}
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
                  <Dialog.Panel
                      className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                    <div className="absolute top-4 right-4">
                      <button
                          type="button"
                          className="inline-flex justify-center p-2 text-gray-400 hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-400"
                          onClick={() => setIsDialogOpen(false)}
                      >
                        <XMarkIcon className="w-8 h-8" aria-hidden="true"/>
                      </button>
                    </div>
                    <div className="mt-2">
                      <ChatSettingsForm readOnly={true} chatSettings={chatSetting}/>
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
