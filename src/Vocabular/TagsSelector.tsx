import _ from 'lodash';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Map } from '../Helpers/Map';
import { ModalWithCloseButton } from '../Helpers/ModalWithCloseButton';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faSquare, faCheckSquare, faMinusSquare } from '@fortawesome/free-solid-svg-icons';


export interface TagsSelectorRef {
  Show$: (tags: string[], selectedTags: string[], partialSelectedTags: string[]) => Promise<{ add: string[], remove: string[] } | undefined>
};

export const TagsSelector = forwardRef<TagsSelectorRef>((props, ref) => {
  const modalRef = useRef<ModalWithCloseButton>(null);
  const [ tags, setTags ] = useState<string[]>([]);
  const [ selectedTags, setSelectedTags ] = useState<string[]>([]);
  const [ partialSelectedTags, setPartialSelectedTags ] = useState<string[]>([]);
  const [ addTags, setAddTags ] = useState<string[]>([]);
  const [ removeTags, setRemoveTags ] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    Show$: async (ts, sts, psts) => {
      setTags(ts);
      setSelectedTags([...sts]);
      setPartialSelectedTags([...psts]);

      const modalResult = await modalRef.current?.Show$();

      return modalResult === 'ok' ? { add: addTags, remove: removeTags } : undefined;
    }
  }));

  function isSelected(tag: string) {
    return selectedTags.includes(tag) || addTags.includes(tag);
  }

  function isPartialSelected(tag: string) {
    return partialSelectedTags.includes(tag) && !removeTags.includes(tag) && !addTags.includes(tag);
  }

  function isUnselected(tag: string) {
    return !selectedTags.includes(tag) && !partialSelectedTags.includes(tag) && !addTags.includes(tag);
  }

  function setTag(tag: string) {
    if (isSelected(tag) || isPartialSelected(tag)) {
      setAddTags(addTags.filter(t => t !== tag));
      setRemoveTags([...removeTags, tag]);
    } else if (isUnselected(tag)) {
      setAddTags([...addTags, tag]);
      setRemoveTags(removeTags.filter(t => t !== tag));
    }
  }

  function onInputKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && inputRef.current) {
      addTag();
    }
  }

  function addTag() {
    if (inputRef.current) {
      setTags(_.uniq([...tags, inputRef.current.value]));
      setTag(inputRef.current.value);

      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }

  return <ModalWithCloseButton ref={modalRef}>
    <Map items={tags} render={tag =>
      <div onClick={() => setTag(tag)}>
        <FAIcon icon={isSelected(tag) ? faCheckSquare :
                      isPartialSelected(tag) ? faMinusSquare : faSquare} />
        {tag}
      </div>
    } />
    <div>
      <input ref={inputRef} onKeyPress={onInputKeyPress} />
    </div>
  </ModalWithCloseButton>;
});
