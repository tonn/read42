import { isArray } from "lodash";

function treeSearchInternal<T>(root: T, childrenSelector: (item: T) => (T[] | undefined), predicate: (item: T) => boolean): T[] {
  let route: T[] = [ root ]
  let childrens: T[][] = [ childrenSelector(root) || [] ];
  let routeLastChildIndexes: number[] = [ 0 ];

  function goDown(): boolean {
    // 1) Идем вниз в первого потомка если есть
    const level = route.length - 1;

    const children = childrens[level];

    if (children.length > 0) {
      routeLastChildIndexes.push(0);
      route.push(children[0]);
      childrens.push(childrenSelector(children[0]) || []);

      return true;
    }

    return false;
  }

  function goUp(): boolean {
    // Ищем предка с непройдеными потомками и идем с первого непройденого потомка
    const level = route.length - 1;
    let parentLevel = level;

    while (true) {
      --parentLevel;

      const parent = route[parentLevel]
      const parentLevelLastChildIndex = routeLastChildIndexes[parentLevel + 1];

      if (!parent) {
        return false;
      }

      if (parentLevelLastChildIndex + 1 < childrens[parentLevel].length) {
        // Переходим на parentLevel + 1 / parentLevelLastChildIndex + 1
        route.splice(parentLevel + 1);
        routeLastChildIndexes.splice(parentLevel + 1);
        childrens.splice(parentLevel + 1);

        const parentChildren = childrens[parentLevel];
        const nextChildIndex = parentLevelLastChildIndex + 1;
        const nextChild = parentChildren[nextChildIndex]

        routeLastChildIndexes.push(nextChildIndex);
        route.push(nextChild);
        childrens.push(childrenSelector(nextChild) || []);

        return true;
      }
    }
  }

  for ( ; ; ) {
    const level = route.length - 1

    if (predicate(route[level])) {
      return route;
    }

    if (!goDown() && !goUp()) {
      return [];
    }
  }
}

export function treeSearch<T>(roots: T[] | T, childrenSelector: (item: T) => (T[] | undefined), predicate: (item: T) => boolean): T[] {
  if (isArray(roots)) {
    for (const root of roots) {
      const result = treeSearchInternal(root, childrenSelector, predicate);

      if (result.length > 0) {
        return result;
      }
    }

    return [];
  } else {
    return treeSearchInternal(roots, childrenSelector, predicate);
  }
}

// export module treeSearch {
//   interface TreeNode {
//     value: string;
//     children?: TreeNode[];
//   }

//   export function test() {
//     const root: TreeNode = {
//       value: '1',
//       children: [{ value: '2',
//         children: [{
//           value: '3'
//         }]
//       }, {
//         value: '4',
//         children: [{
//           value: '5',
//           children: [{
//             value: '7'
//           }]
//         }]
//       }, {
//         value: '6',
//         children: [{
//           value: '7'
//         }]
//       }]
//     }

//     console.assert(treeSearch({ value: '1' } as TreeNode, item => item.children || [], item => item.value === '5').length === 0);
//     console.assert(treeSearch(root, item => item.children, item => item.value === '1').pop() === root);
//     console.assert(treeSearch(root, item => item.children, item => item.value === '2').pop() === root.children![0]);
//     console.assert(treeSearch(root, item => item.children, item => item.value === '3').pop() === root.children![0].children![0]);
//     console.assert(treeSearch(root, item => item.children, item => item.value === '4').pop() === root.children![1]);
//     console.assert(treeSearch(root, item => item.children, item => item.value === '5').pop() === root.children![1].children![0]);
//     console.assert(treeSearch(root, item => item.children, item => item.value === '6').pop() === root.children![2]);
//     console.assert(treeSearch(root, item => item.children, item => item.value === '7').pop() === root.children![1].children![0].children![0]);
//   }
// }
