module Coprl::Presenters::WebClient::Helpers
  module AlignmentHelpers
    private

    # controls content alignment (how items are laid out along a grid's block
    # axis) for an entire grid.
    def grid_align_class(value)
      return unless value
      "v-grid--align-#{value}"
    end

    # controls content justification (how items are laid out along the grid's
    # inline axis) for an entire grid.
    def grid_justify_class(value)
      return unless value
      "v-grid--justify-#{value}"
    end

    # controls content flow/direction for an entire grid.
    def grid_direction_class(value)
      return unless value
      "v-grid--direction-#{value}"
    end

    # controls content alignment for a single column, overriding any value set
    # for the column's parent grid.
    def column_align_class(value)
      return unless value
      "v-column--align-#{value}"
    end

    # controls content justification for a single column, overriding any value
    # set for the column's parent grid.
    def column_justify_class(value)
      return unless value
      "v-column--justify-#{value}"
    end

    # controls content flow/direction for a single column, overriding any value
    # set for the column's parent grid.
    def column_direction_class(value)
      return unless value
      "v-grid-column--direction-#{value}"
    end
  end
end
