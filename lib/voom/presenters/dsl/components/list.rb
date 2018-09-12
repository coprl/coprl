require_relative 'lists/line'
require_relative 'lists/separator'
require_relative 'lists/header'
require_relative 'mixins/content'
require_relative 'mixins/append'
require_relative 'mixins/attaches'

module Voom
  module Presenters
    module DSL
      module Components
        class List < Base
          include Mixins::Content
          include Mixins::Append
          include Mixins::Attaches
          
          attr_reader :lines, :lines_only, :color, :border, :selectable, :total_lines
          attr_accessor :components
          
          def initialize(**attribs_, &block)
            super(type: :list, **attribs_, &block)
            @color  = attribs.delete(:color) { nil }
            @border = attribs.delete(:border) { nil }

            @lines_only = attribs.delete(:lines_only) { false }
            @selectable = attribs.delete(:selectable) { false }
            @lines = []
            @components = []
            @total_lines = attribs.delete(:total_lines) || 0
            add_select_control!( attribs.fetch(:select_control_label) { 'Select All' } )
            expand!
          end

          def add_select_control!(text)
            return unless @selectable && !@lines_only
            @lines << Lists::Header.new(parent: self,
                                        total_lines: @total_lines,
                                        checkbox: {text: text})
          end

          def line(text=nil, **attribs, &block)
            @lines << Lists::Line.new(parent:self, text: text, selectable: selectable, **attribs, &block)
          end

          def separator(**attribs, &block)
            @lines << Lists::Separator.new(parent:self, **attribs, &block)
          end
        end
      end
    end
  end
end


