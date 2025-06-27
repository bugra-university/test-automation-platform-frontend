import React from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../../DropDown/DropdownMenu';
import { ArchiveRestore, Maximize, Plus, Share2, Trash } from "lucide-react";

interface OptionsDropdownMenuProps {
  isFileInDatabase: boolean;
  showTable: boolean;
  isExcelEditMode: boolean;
  onFullscreen: () => void;
  onDelete: () => void;
  onEditModeToggle: () => void;
}

export const OptionsDropdownMenu: React.FC<OptionsDropdownMenuProps> = ({
  isFileInDatabase,
  showTable,
  isExcelEditMode,
  onFullscreen,
  onDelete,
  onEditModeToggle
}) => {
  const handleSaveClick = () => {
    console.log("Database Save/Update button clicked!");
    window.dispatchEvent(new CustomEvent('triggerExcelSave'));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="header-action-btn" title="Options">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Plus size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
            <span>New</span>
            <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>Framework</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value="nextjs">
                  <DropdownMenuRadioItem value="nextjs">Next.js</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="sveltekit" disabled>
                    SvelteKit
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="remix">Remix</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="astro">Astro</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>Database</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>                <DropdownMenuCheckboxItem
                  onSelect={handleSaveClick}
                >
                  {isFileInDatabase ? 'Update' : 'Save'}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  onSelect={onEditModeToggle}
                  disabled={!showTable}
                  checked={isExcelEditMode}
                >
                  Edit
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Delete
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={onFullscreen}>
            <Maximize size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
            <span>Fullscreen</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Share2 size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
            <span>Share</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ArchiveRestore size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
            <span>Archive</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem onSelect={onDelete} className="text-delete focus:text-delete">
          <Trash size={16} strokeWidth={2} aria-hidden="true" />
          <span>Delete</span>
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
