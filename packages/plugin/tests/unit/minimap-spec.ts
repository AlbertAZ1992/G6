import G6 from '@antv/g6';
import Simulate from 'event-simulate';
import Minimap from '../../src/minimap';

export function mathEqual(a: number, b: number) {
  return Math.abs(a - b) < 1;
}

const div = document.createElement('div');
div.id = 'minimap';
document.body.appendChild(div);
const container = document.createElement('div');
container.id = 'minimap-container';
div.appendChild(container);

describe('minimap', () => {
  it('minimap with default settings & destroy', (done) => {
    const minimap = new Minimap({ size: [200, 200] });
    const graph = new G6.Graph({
      container: div,
      width: 500,
      height: 500,
      defaultEdge: {
        type: 'line',
        style: {
          endArrow: {
            path: 'M 10,0 L -10,-10 L -10,10 Z',
            d: 10,
          },
        },
      },
      modes: {
        default: [
          {
            type: 'drag-node',
            delegate: false,
          },
          'zoom-canvas',
          'click-select',
          'drag-canvas',
        ],
      },
      plugins: [minimap],
    });

    graph.addItem('node', { id: 'node1', label: 'text1', x: 50, y: 50 });
    graph.addItem('node', { id: 'node2', label: 'text2', x: 120, y: 150 });
    graph.addItem('node', { id: 'node3', label: 'text3', x: 150, y: 190 });
    graph.addItem('node', { id: 'node4', label: 'text4', x: 220, y: 250 });
    graph.addItem('edge', { id: 'edge1', source: 'node1', target: 'node2' });
    const canvas = minimap.getCanvas();
    expect(canvas).not.toBe(undefined);
    expect(canvas.get('width')).toEqual(200);
    expect(canvas.get('height')).toEqual(200);

    const viewport = minimap.getViewport();
    expect(viewport).not.toBe(undefined);
    expect(viewport.className.indexOf('g6-minimap-viewport') >= 0).toBe(true);

    // 缩小的时候，viewport已经最大了，不会更大
    graph.zoom(0.5, { x: 250, y: 250 });
    expect(viewport.style.left).toEqual('0px');
    expect(viewport.style.top).toEqual('0px');
    expect(viewport.style.width).toEqual('200px');
    expect(viewport.style.height).toEqual('200px');

    graph.zoom(2.5, { x: 250, y: 250 });

    setTimeout(() => {
      const left = parseFloat(viewport.style.left.substr(0, viewport.style.left.length - 2));
      const top = parseFloat(viewport.style.top.substr(0, viewport.style.top.length - 2));
      const width = parseFloat(viewport.style.width.substr(0, viewport.style.width.length - 2));
      const height = parseFloat(viewport.style.height.substr(0, viewport.style.height.length - 2));
      expect(mathEqual(left, 47)).toBe(true);
      expect(mathEqual(top, 38)).toBe(true);
      expect(mathEqual(width, 153)).toBe(true);
      expect(mathEqual(height, 162)).toBe(true);

      graph.zoom(2.5, { x: 250, y: 250 });
      setTimeout(() => {
        const left = parseFloat(viewport.style.left.substr(0, viewport.style.left.length - 2));
        const top = parseFloat(viewport.style.top.substr(0, viewport.style.top.length - 2));
        const width = parseFloat(viewport.style.width.substr(0, viewport.style.width.length - 2));
        const height = parseFloat(
          viewport.style.height.substr(0, viewport.style.height.length - 2),
        );

        expect(mathEqual(left, 121)).toBe(true);
        expect(mathEqual(top, 112)).toBe(true);
        expect(mathEqual(width, 78)).toBe(true);
        expect(mathEqual(height, 87)).toBe(true);

        minimap.destroyPlugin();

        const container: HTMLElement = div.childNodes[1] as HTMLElement;
        expect(container.innerHTML).toEqual('');

        done();
      }, 100);
    }, 100);
  });
  it('move viewport', (done) => {
    const minimap = new Minimap({ size: [200, 200] });
    const graph = new G6.Graph({
      container: div,
      width: 500,
      height: 500,
      plugins: [minimap],
      modes: {
        default: ['zoom-canvas', 'drag-canvas'],
      },
    });
    const data = {
      nodes: [
        {
          id: '1',
          x: 50,
          y: 80,
        },
        {
          id: '2',
          x: 140,
          y: 100,
        },
        {
          id: '3',
          x: 250,
          y: 250,
        },
      ],
      edges: [
        {
          source: '1',
          target: '2',
        },
      ],
    };
    graph.data(data);
    graph.render();

    const viewport = minimap.getViewport();

    graph.zoom(2, { x: 250, y: 250 });
    graph.translate(50, 50);

    setTimeout(() => {
      expect(viewport.style.left).toEqual('68.8474px');
      expect(viewport.style.top).toEqual('59.5016px');
      expect(viewport.style.width).toEqual('131.153px');
      expect(viewport.style.height).toEqual('140.498px');

      Simulate.simulate(viewport, 'dragstart', {
        clientX: 100,
        clientY: 100,
        target: viewport,
      });

      Simulate.simulate(viewport, 'drag', {
        clientX: 98,
        clientY: 91,
      });

      Simulate.simulate(viewport, 'dragend', {
        clientX: 98,
        clientY: 91,
      });

      setTimeout(() => {
        expect(viewport.style.left).toEqual('66.8474px');
        expect(viewport.style.top).toEqual('50.5016px');
        expect(viewport.style.width).toEqual('133.153px');
        expect(viewport.style.height).toEqual('149.498px');
        const matrix = graph.get('group').getMatrix();
        expect(matrix[0]).toEqual(2);
        expect(matrix[4]).toEqual(2);
        graph.destroy();
        done();
      }, 100);
    }, 100);
  });
  it('invalid dom event', () => {
    const minimap = new Minimap({ size: [200, 200] });
    const graph = new G6.Graph({
      container: div,
      width: 500,
      height: 500,
      plugins: [minimap],
      modes: {
        default: ['zoom-canvas'],
      },
    });
    const data = {
      nodes: [
        {
          id: '1',
          x: 50,
          y: 80,
        },
        {
          id: '2',
          x: 140,
          y: 100,
        },
      ],
      edges: [
        {
          source: '1',
          target: '2',
        },
      ],
    };
    graph.data(data);
    graph.render();

    const viewport = minimap.getContainer();

    Simulate.simulate(viewport, 'drag', {
      clientX: 100,
      clientY: 100,
    });

    viewport.style.width = '300px';
    Simulate.simulate(viewport, 'dragstart', {
      clientX: 100,
      clientY: 100,
      target: null,
    });
  });
  it('delegate type of minimap', (done) => {
    const minimap = new Minimap({
      size: [200, 200],
      type: 'delegate',
      delegateStyle: {
        fill: '#fff',
      },
    });

    const graph = new G6.Graph({
      container: div,
      width: 500,
      height: 500,
      plugins: [minimap],
    });

    const nodeBBox = graph.addItem('node', { id: 'node', x: 100, y: 100, size: 16 }).getBBox();

    const canvas = minimap.getCanvas();
    setTimeout(() => {
      const delegateShape = canvas.get('children')[0].get('children')[0];
      expect(delegateShape.attr('x')).toEqual(nodeBBox.minX);
      expect(delegateShape.attr('y')).toEqual(nodeBBox.minY);
      expect(delegateShape.attr('width')).toEqual(nodeBBox.width);
      expect(delegateShape.attr('height')).toEqual(nodeBBox.height);
      expect(delegateShape.attr('fill')).toEqual('#fff');
      expect(delegateShape.attr('stroke')).toEqual('#096dd9');
      graph.destroy();
      done();
    }, 100);
  });
  it('minimap container', () => {
    const minimap = new Minimap({
      container,
      size: [200, 200],
      className: 'test-className',
    });

    const graph = new G6.Graph({
      container: div,
      width: 500,
      height: 500,
      plugins: [minimap],
      modes: {
        default: [
          {
            type: 'drag-node',
            delegate: false,
          },
          'zoom-canvas',
          'click-select',
          'drag-canvas',
        ],
      },
    });

    const minimapContainer: HTMLElement = container.childNodes[0] as HTMLElement;
    expect(minimapContainer.childNodes).not.toBe(undefined);
    expect(minimapContainer.className).toEqual('test-className');
    expect(minimapContainer.style.width).toEqual('200px');
    expect(minimapContainer.style.width).toEqual('200px');

    const minimapContainerNode = minimapContainer.childNodes[0] as HTMLElement;
    expect(minimapContainerNode.tagName).toEqual('DIV');
    expect(minimapContainerNode.style.position).toEqual('relative');
    expect(minimapContainerNode.childNodes[0]).toEqual(minimap.getCanvas().get('el'));

    graph.destroy();
    expect(container.innerHTML).toEqual('');
  });
  it('canvas minX minY < 0', (done) => {
    const minimap = new Minimap({
      size: [200, 200],
    });
    const graph = new G6.Graph({
      container: div,
      width: 500,
      height: 500,
      plugins: [minimap],
      defaultNode: {
        size: 60,
      },
      modes: {
        default: ['drag-node', 'drag-canvas', 'zoom-canvas'],
      },
    });
    graph.addItem('node', { id: 'node1', x: -50, y: -50 });

    setTimeout(() => {
      const canvas = minimap.getCanvas();
      const group = canvas.get('children')[0];
      const matrix = group.getMatrix();

      expect(matrix[6] - 30 < 1).toBe(false);
      expect(matrix[7] - 30 < 1).toBe(false);
      graph.destroy();
      done();
    }, 100);
  });
  it('keyShapeOnly minimap', (done) => {
    const minimap = new Minimap({ size: [200, 200], type: 'keyShape' });
    const graph = new G6.Graph({
      container: div,
      width: 500,
      height: 500,
      plugins: [minimap],
    });
    graph.addItem('node', { id: 'node1', label: 'text1', x: 50, y: 50 });
    graph.addItem('node', { id: 'node2', label: 'text2', x: 120, y: 150 });
    graph.addItem('edge', { id: 'edge1', source: 'node1', target: 'node2' });

    const canvas = minimap.getCanvas();
    setTimeout(() => {
      const shapeGroup = canvas.get('children')[0].get('children');
      expect(shapeGroup.length).toEqual(3);
      expect(shapeGroup[0].attr('path')).not.toBe(undefined);
      expect(shapeGroup[1].attr('x')).toEqual(50);
      expect(shapeGroup[1].attr('y')).toEqual(50);
      expect(shapeGroup[2].attr('x')).toEqual(120);
      expect(shapeGroup[2].attr('y')).toEqual(150);
      graph.destroy();
      done();
    }, 100);
  });
  it('get minimap container', () => {
    const minimap = new Minimap({ size: [200, 200], type: 'keyShape' });
    const graph = new G6.Graph({
      container: div,
      width: 500,
      height: 500,
      plugins: [minimap],
    });

    const container = minimap.getContainer();
    expect(container).not.toBe(undefined);
    expect(container.className).toBe('g6-minimap');
    graph.destroy();
  });
  it('minimap beforeanimate afteranimate', () => {
    const minimap = new Minimap({ size: [200, 200] });
    const graph = new G6.Graph({
      container: div,
      width: 500,
      height: 500,
      plugins: [minimap],
    });

    graph.emit('beforeanimate');
    expect(minimap.get('refresh')).toBe(false);
    graph.emit('afteranimate');
    expect(minimap.get('refresh')).toBe(true);
    graph.destroy();
  });
});

describe('minimap with hidden shape', () => {
  G6.registerNode(
    'my-node',
    {
      drawShape: (cfg, group) => {
        const mainGroup = group.addGroup({
          id: 'main-group',
        });
        const rect = mainGroup.addShape('rect', {
          attrs: {
            fill: '#fff',
          },
          name: 'main-box',
        });

        const shape = mainGroup.addShape('rect', {
          attrs: {
            fill: '#fff',
            stroke: '#FA8C16',
            radius: 4,
          },
          name: 'main-shape',
        });

        if (cfg.open) {
          mainGroup.addShape('rect', {
            attrs: {
              x: 0,
              y: -4,
              width: 266,
              height: 4,
              fill: '#FA8C16',
              stroke: '#FA8C16',
              radius: [6, 6, 0, 0],
            },
            name: 'css-rect',
          });
        } else {
          mainGroup.addShape('rect', {
            attrs: {
              x: 0,
              y: 0,
              width: 4,
              height: 40,
              fill: '#FA8C16',
              stroke: '#FA8C16',
              radius: [6, 0, 0, 6],
            },
            name: 'css-rect',
          });
        }
        const text = mainGroup.addShape('text', {
          attrs: {
            text: '文本0',
            x: 14,
            y: 20,
            textAlign: 'left',
            textBaseline: 'middle',
            fill: '#666',
            fontSize: 14,
          },

          name: 'rect-shape',
          zIndex: 0,
        });

        const detailGroup = group.addGroup({
          id: 'detail-group',
        });
        detailGroup.addShape('text', {
          attrs: {
            text: '文本1',
            x: 14,
            y: 46,
            textAlign: 'left',
            textBaseline: 'middle',
            fill: '#666',
          },
          name: 'desc',
        });
        detailGroup.addShape('text', {
          attrs: {
            text: '文本2',
            x: 14,
            y: 66,
            textAlign: 'left',
            textBaseline: 'middle',
            fill: '#666',
          },
          name: 'dbName',
        });
        detailGroup.addShape('text', {
          attrs: {
            text: '文本3',
            x: 134,
            y: 66,
            textAlign: 'left',
            textBaseline: 'middle',
            fill: '#666',
          },
          name: 'dbType',
        });
        detailGroup.addShape('image', {
          attrs: {
            x: 0,
            y: 60,
            width: 16,
            height: 16,
            img:
              'https://g.alicdn.com/cm-design/arms-trace/1.0.155/styles/armsTrace/images/TAIR.png',
          },
          // must be assigned in G6 3.3 and later versions. it can be any value you want
          name: 'btn',
          data: cfg.detail,
        });
        if (cfg.open) {
          detailGroup.show();
          rect.attr({
            x: 0,
            y: 0,
            width: 280,
            height: 134,
          });
          shape.attr({
            x: 0,
            y: 0,
            width: 266,
            height: 134,
          });
        } else {
          detailGroup.hide();
          rect.attr({
            x: 0,
            y: 0,
            width: 280,
            height: 40,
          });
          shape.attr({
            x: 0,
            y: 0,
            width: 266,
            height: 40,
          });
        }

        return rect;
      },
      update: undefined,
    },
    'single-node',
  );

  it('svg renderer, minimap with hidden shape in custom node', (done) => {
    const minimap = new Minimap({ size: [200, 200] });
    const graph = new G6.Graph({
      container: div,
      width: 500,
      height: 500,
      plugins: [minimap],
      renderer: 'svg',
      defaultNode: {
        type: 'my-node',
      },
    });

    graph.addItem('node', { id: 'node1', label: 'text1', x: 50, y: 50, open: true });
    graph.addItem('node', { id: 'node2', label: 'text2', x: 120, y: 150, open: true });
    graph.addItem('node', { id: 'node3', label: 'text3', x: 150, y: 190 });
    graph.addItem('node', { id: 'node4', label: 'text4', x: 220, y: 250 });

    setTimeout(() => {
      const minimapCanvas = minimap.getCanvas();
      const minimapRootGroup = minimapCanvas.get('children')[0];
      expect(
        minimapRootGroup.get('children')[2].get('children')[3].get('children')[1].get('visible'),
      ).toBe(false);
      done();
    }, 100);
  });
});
