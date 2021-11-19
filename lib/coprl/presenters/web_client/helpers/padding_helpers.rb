# used used by the grid, content and card erbs
module Coprl::Presenters::WebClient::Helpers
  module PaddingHelpers
    private

    def padding_array(padding, nesting = 0)
      if padding
        padding = Array(padding)
        return (NO_PADDING - padding.map { |p| "#{p.to_s.gsub(NUMBER, '')}0".to_sym } + padding.map(&:to_sym)).sort
      end

      nesting > 1 ? NESTED_PADDING : []
    end

    def padding_classes(padding, nesting = 0)
      padding_array(padding, nesting).map { |p| "v-padding--#{p}" }.join(' ')
    end

    def alignment_class(align)
      "v-grid-column-align-#{align}"
    end

    private

    NUMBER = %r{\d}.freeze
    NO_PADDING = %i[top0 right0 bottom0 left0].sort.freeze
    NESTED_PADDING = %i[top3 right0 bottom3 left0].sort.freeze
  end
end
