require 'zeitwerk'

class MyInflector < Zeitwerk::GemInflector
  def camelize(basename, _abspath)
    case basename
    when "dsl"
      "DSL"
    else
      super
    end
  end
end

loader = Zeitwerk::Loader.for_gem(warn_on_extra_files: false)
loader.inflector = MyInflector.new(__FILE__)
loader.setup
loader.ignore("#{__dir__}/generators")

module Coprl
end

if defined?(::Rails)
  # We need this class's file to be parsed, but we want to let Zeitwerk load it
  Coprl::Presenters::Rails::Railtie
  Coprl::Presenters::Rails::Engine
end
