'use strict';

angular.module('d3AngularApp', ['d3'])
.directive('d3Bars', ['$window', '$timeout', 'd3Service', 
  function($window, $timeout, d3Service) {
    console.log('Running directive');
    return {
      restrict: 'A',
      scope: {
        data: '=',
        label: '@',
        onClick: '&'
      },
      link: function(scope, ele, attrs) {
        
        d3Service.d3().then(function(d3) {
 
          var renderTimeout;
          var margin = parseInt(attrs.margin) || 20,
              barHeight = parseInt(attrs.barHeight) || 20,
              barPadding = parseInt(attrs.barPadding) || 5;
 
          var svg = d3.select(ele[0])
            .append('svg')
            .style('width', '100%');
 
          $window.onresize = function() {
            scope.$apply();
          };
 
          scope.$watch(function() {
            return angular.element($window)[0].innerWidth;
          }, function() {
            console.log('init-1');
            scope.render(scope.data);
          });
 
          scope.$watch('data', function(newData) {
            console.log('init-2');
            console.log(newData);
            scope.render(newData);
          }, true);
 
          scope.render = function(data) {
            console.log('REnder CAlled');
            svg.selectAll('*').remove();
            console.log('1.2');
            if (!data) return;
            console.log('1.5');
            if (renderTimeout) clearTimeout(renderTimeout);
            console.log('Step 2');
 
            renderTimeout = $timeout(function() {
              console.log('Inner Rend');
              var width = d3.select(ele[0])[0][0].offsetWidth - margin,
                  height = scope.data.length * (barHeight + barPadding),
                  color = d3.scale.category20(),
                  xScale = d3.scale.linear()
                    .domain([0, d3.max(data, function(d) {
                      return d.score;
                    })])
                    .range([0, width]);
 
              svg.attr('height', height);
              console.log(barHeight);
              svg.selectAll('rect')
                .data(data)
                .enter()
                  .append('rect')
                  .on('click', function(d,i) {
                    return scope.onClick({item: d});
                  })
                  .attr('height', barHeight)
                  .attr('width', 140)
                  .attr('x', Math.round(margin/2))
                  .attr('y', function(d,i) {
                    return i * (barHeight + barPadding);
                  })
                  .attr('fill', function(d) {
                    return color(d.score);
                  })
                  .transition()
                    .duration(1000)
                    .attr('width', function(d) {
                      return xScale(d.score);
                    });
              svg.selectAll('text')
                .data(data)
                .enter()
                  .append('text')
                  .attr('fill', '#fff')
                  .attr('y', function(d,i) {
                    return i * (barHeight + barPadding) + 15;
                  })
                  .attr('x', 15)
                  .text(function(d) {
                    return d.name + ' (scored: ' + d.score + ')';
                  });
            }, 200);
          };
        });
      }};
}]);