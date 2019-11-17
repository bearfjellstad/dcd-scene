/**
 * @author alteredq / http://alteredqualia.com/
 */

import Pass from './Pass';

export default class ClearMaskPass extends Pass {
  constructor() {
    super();

    this.needsSwap = false;
  }

  render(renderer, writeBuffer, readBuffer, delta, maskActive) {
    renderer.state.buffers.stencil.setTest(false);
  }
}
