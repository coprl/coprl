# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'voom/presenters/version'

Gem::Specification.new do |spec|
  spec.name = 'voom-presenters'
  spec.version = Voom::Presenters::VERSION
  spec.authors = ['Russell Edens']
  spec.email = ["russell@voomify.com\n"]

  spec.summary = 'Presenters Gem.'
  spec.homepage = 'http://github.com/rx/presenters'
  spec.license = 'MIT'

  spec.files = `git ls-files -z`.split("\x0").reject do |f|
    f.match(%r{^(test|spec|features)/})
  end
  spec.bindir = 'exe'
  spec.executables = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ['lib']

  spec.add_runtime_dependency 'ice_nine', '~>0.11'
  spec.add_runtime_dependency 'dry-container', '~>0.6'
  spec.add_runtime_dependency 'dry-configurable', '>0.1', '<= 7.0'
  spec.add_runtime_dependency 'dry-inflector', '~>0.1'
  spec.add_runtime_dependency 'sinatra', '>=1.4', '< 3.0'
  spec.add_runtime_dependency  'tzinfo', '~>1.2'
  spec.add_runtime_dependency  'tzinfo-data', '~>1.2018'
  spec.add_runtime_dependency  'redcarpet', '~>3.4'
  spec.add_runtime_dependency  'nokogiri', ">= 1.7.2"
  spec.add_runtime_dependency 'filewatcher', '~> 1.1.1'
  spec.add_runtime_dependency 'zeitwerk', '~> 1.4.3'

  spec.add_development_dependency 'rack-test', '~>0.8'
  spec.add_development_dependency 'rack', '>= 2.0.6'
  spec.add_development_dependency 'pry', '~>0.10'
  spec.add_development_dependency 'bundler', '~> 1.13'
  spec.add_development_dependency 'rake', '~> 11.3'
  spec.add_development_dependency 'rspec', '~> 3.0'
  spec.add_development_dependency 'gem-release', '~> 2.0'
  spec.add_development_dependency 'shotgun', '~> 0.9'

end
