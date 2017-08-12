import React, { Component } from 'react'
import { Table, Jumbotron } from 'react-bootstrap'
import { extend } from 'lodash'
import { SearchkitManager,SearchkitProvider,
  SearchBox, RefinementListFilter, Pagination,
  HierarchicalMenuFilter, HitsStats, SortingSelector, NoHits,
  ResetFilters, RangeFilter, NumericRefinementListFilter,
  ViewSwitcherHits, ViewSwitcherToggle, DynamicRangeFilter,
  InputFilter, GroupedSelectedFilters,
  Layout, TopBar, LayoutBody, LayoutResults,
  ActionBar, ActionBarRow, SideBar } from 'searchkit'
import { Chart, Pies, Title, Transform } from 'rumble-charts'
import './index.css'

// const host = "http://demo.searchkit.co/api/movies"
const host = "http://localhost:9200/wordlist";
const searchkit = new SearchkitManager(host)

const MovieHitsGridItem = (props)=> {
  const {bemBlocks, result} = props
  let url = "http://www.imdb.com/title/" + result._source.imdbId
  const source:any = extend({}, result._source, result.highlight)
  var dontKnow = props.result._source.totalCount - props.result._source.knowCount
  var series = [{
            data: [{y: props.result._source.totalCount, color: 'red'}, {y: props.result._source.knowCount, color: 'green'}]
        }]
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <a href={url} target="_blank">
        <div>
          <Jumbotron width="170" height="240">
            <Table>
                  <tbody>
                  <tr>
                      <td>
                          <p>{props.result._source.meaning}</p>
                      </td>
                      <td>
                          <Chart width={170} height={50} series={series}>
                              <Transform method={['transpose', 'stack']}>
                                  <Pies 
                                      colors = 'category10'
                                      combined={true} 
                                      pieAttributes={{
                                          onMouseMove: (e) => e.target.style.opacity = 1.5,
                                          onMouseLeave: (e) => e.target.style.opacity = 0.85
                                      }}
                                      pieStyle={{opacity: 0.85}}
                                      />
                              </Transform>
                          </Chart>
                      </td>
                  </tr>
                  </tbody>
              </Table>
          </Jumbotron>
        </div>
        <div data-qa="title" className={bemBlocks.item("title")}>
          <h1>{props.result._source.word}</h1>
        </div>
      </a>
    </div>
  )
}

const MovieHitsListItem = (props)=> {
  const {bemBlocks, result} = props
  let url = "http://www.imdb.com/title/" + result._source.imdbId
  const source:any = extend({}, result._source, result.highlight)
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <div className={bemBlocks.item("poster")}>
        <img alt="presentation" data-qa="poster" src={result._source.poster}/>
      </div>
      <div className={bemBlocks.item("details")}>
        <a href={url} target="_blank"><h2 className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:source.title}}></h2></a>
        <h3 className={bemBlocks.item("subtitle")}>Released in {source.year}, rated {source.imdbRating}/10</h3>
        <div className={bemBlocks.item("text")} dangerouslySetInnerHTML={{__html:source.plot}}></div>
      </div>
    </div>
  )
}

class App extends Component {

  constructor(props) {

      super(props);
  }

  render() {
    return (
      <SearchkitProvider searchkit={searchkit}>
        <Layout>
          <TopBar>
            <div className="my-logo">Vocab<br/>Builder</div>
            <SearchBox 
                autofocus={true} 
                searchOnChange={false}
                queryFields={["word"]}/>
          </TopBar>

        <LayoutBody>

          <SideBar>
            <HierarchicalMenuFilter fields={["type.raw", "genres.raw"]} title="Categories" id="categories"/>
            <DynamicRangeFilter field="metaScore" id="metascore" title="Metascore" rangeFormatter={(count)=> count + "*"}/>
            <RangeFilter min={0} max={10} field="imdbRating" id="imdbRating" title="IMDB Rating" showHistogram={true}/>
            <InputFilter id="writers" searchThrottleTime={500} title="Alphabets" placeholder="Search Alphabets" searchOnChange={true} queryFields={["writers"]} />
            <RefinementListFilter id="actors" title="Actors" field="actors.raw" size={10}/>
            <RefinementListFilter translations={{"facets.view_more":"View more writers"}} id="writers" title="Writers" field="writers.raw" operator="OR" size={10}/>
            <RefinementListFilter id="countries" title="Countries" field="countries.raw" operator="OR" size={10}/>
            <NumericRefinementListFilter id="runtimeMinutes" title="Length" field="runtimeMinutes" options={[
              {title:"All"},
              {title:"up to 20", from:0, to:20},
              {title:"21 to 60", from:21, to:60},
              {title:"60 or more", from:61, to:1000}
            ]}/>
          </SideBar>
          <LayoutResults>
            <ActionBar>

              <ActionBarRow>
                <HitsStats translations={{
                  "hitstats.results_found":"{hitCount} results found"
                }}/>
                <ViewSwitcherToggle/>
                <SortingSelector options={[
                  {label:"Relevance", field:"_score", order:"desc"},
                  {label:"Latest Releases", field:"released", order:"desc"},
                  {label:"Earliest Releases", field:"released", order:"asc"}
                ]}/>
              </ActionBarRow>

              <ActionBarRow>
                <GroupedSelectedFilters/>
                <ResetFilters/>
              </ActionBarRow>

            </ActionBar>
            <ViewSwitcherHits
                hitsPerPage={20} highlightFields={["word"]}
                hitComponents={[
                  {key:"grid", title:"Grid", itemComponent:MovieHitsGridItem, defaultOption:true},
                  {key:"list", title:"List", itemComponent:MovieHitsListItem}
                ]}
                scrollTo="body"
            />
            <NoHits suggestionsField={"word"}/>
            <Pagination showNumbers={true}/>
          </LayoutResults>

          </LayoutBody>
        </Layout>
      </SearchkitProvider>
    );
  }
}

export default App;
