import React, { Component } from 'react'
import ui from '../ui'
import bem from '../bem'
import { t } from '../utils'

export default class TimedGridModal extends Component {

  constructor (props) {
    super(props)
    this.state = {
      show: this.props.show,
      flash: '30',
      enumeratorHelpText: '',
      studentDialogueText: '',
      words: '',
      wordsAsArray: [],
      wordsCount: '',
      displayExample: false,
      step: 1
    }
    this.cancelTimedGrid = this.cancelTimedGrid.bind(this)
    this.toggleDisplayExample = this.toggleDisplayExample.bind(this)
    this.setEnumeratorHelpText = this.setEnumeratorHelpText.bind(this)
    this.setStudentDialogueText = this.setStudentDialogueText.bind(this)
    this.changeTimedGridStep = this.changeTimedGridStep.bind(this)
    this.setGridWords = this.setGridWords.bind(this)
    this.handleFlashTimerChange = this.handleFlashTimerChange.bind(this)
    this.createTimedGrid = this.createTimedGrid.bind(this)
  }
  shouldComponentUpdate (newProps, newState) {
    this.setState({
      show: newProps.show
    })
    return true
  }
  cancelTimedGrid () {
    this.props.survey.trigger('hide-timed-grid')
  }
  toggleDisplayExample () {
    this.setState({
      'displayExample': !this.state.displayExample
    })
  }
  setEnumeratorHelpText (e) {
    this.setState({
      'enumeratorHelpText': e.target.value
    })
  }
  setStudentDialogueText (e) {
    this.setState({
      'studentDialogueText': e.target.value
    })
  }
  changeTimedGridStep (step) {
    this.setState({
      'step': step
    })
  }
  setGridWords (e) {
    const words = e.target.value
    const wordsAsArray = e.target.value.split(' ').filter(item => item !== '')
    const wordsCount = wordsAsArray.length
    this.setState({
      words,
      wordsAsArray,
      wordsCount
    })
  }
  handleFlashTimerChange (e) {
    this.setState({
      'flash': e.target.value
    })
  }
  createTimedGrid () {
    this.props.survey.trigger('timed-grid-created', this.state)
  }
  // END TIMED GRID SPECIFIC FUNCTIONS =======>
  render () {
    return (
      <ui.Modal open onClose={this.cancelTimedGrid} title={t('Timed Grid')}>
        <ui.Modal.Body>
          {this.state.step == 1 &&
            <div>
              <bem.FormModal__item>
                <p>This is a tool used to evaluate the level of early grade students in different subject areas by capturing their responses un test sessions and using that response data to help assess educational needs</p>
                {this.state.displayExample && <img src={'../../img/timedGridExample.png'} /> }
              </bem.FormModal__item>

              <bem.FormModal__item>
                <button className='mdl-button mdl-button--colored' onClick={this.toggleDisplayExample} style={{ 'paddingLeft': 0, 'paddingRight': 0 }}>
                  {this.state.displayExample ? t('Hide Example') : t('Show Example')}
                  <i className='k-icon-dropdown-arrow'/>
                </button>
              </bem.FormModal__item>

              <bem.FormModal__item>
                <label>
                  {t('Enumerator help')}
                </label>
                <input 
                  type='text' 
                  value={this.state.enumeratorHelpText} 
                  onChange={this.setEnumeratorHelpText}/>
              </bem.FormModal__item>

              <bem.FormModal__item>
                <label>
                  {t('Student dialogue')}
                </label>
                <input 
                  type='text' 
                  value={this.state.studentDialogueText} 
                  onChange={this.setStudentDialogueText}/>
              </bem.FormModal__item>

              <bem.FormModal__item m={'actions'}>
                <button className='mdl-button mdl-button--colored' onClick={this.cancelTimedGrid}>
                  {t('Cancel')}
                </button>
                <button className='mdl-button mdl-button--raised mdl-button--colored' onClick={() => this.changeTimedGridStep(2)}>
                  {t('Next')}
                </button>
              </bem.FormModal__item>
            </div>
          }

          {this.state.step == 2 && 
            <div>
              <bem.FormModal__item>
                <p>All assessments have a 600 second countdown timer.</p>
              </bem.FormModal__item>

              <bem.FormModal__item>
                <label>
                  {t('Grid items')}
                </label>
                <div 
                  className='word-spans-wrapper'
                  style={{
                    maxHeight: '120px',
                    overflowY: 'auto',
                    borderBottom: '1px solid #EEEEEE',
                    paddingBottom: '2px'
                  }}
                >
                  {this.state.wordsAsArray.map((item, key) => {
                    return (
                      <span style={{
                        margin: '3px 2px',
                        backgroundColor: '#EEEEEE',
                        color: '#72747E',
                        borderRadius: '15px',
                        padding: '2px 7px',
                        display: 'inline-block',
                        fontSize: '0.95em'
                      }} data-badge='4' key={key}>{item}</span>
                    )
                  })}
                </div>
                <p className='pull-right' style={{fontSize: '0.9em', margin: '2px 0'}}>{this.state.wordsCount} {t('words')}</p>
                <textarea
                  onChange={this.setGridWords}
                  value={this.state.words}
                  rows='5'
                />
              </bem.FormModal__item>

              <bem.FormModal__item>
                <h3>{t('Flash Timer')}</h3>

                <label className='mdl-radio mdl-js-radio mdl-js-ripple-effect'>
                  <input 
                    type='radio' 
                    className='mdl-radio__button'
                    name='options'
                    value='30'
                    checked={this.state.flash === '30'}
                    onChange={this.handleFlashTimerChange}
                  />
                  <span className='mdl-radio__label'>{t('At 30 seconds')}</span>
                </label>

                <label className='mdl-radio mdl-js-radio mdl-js-ripple-effect'>
                  <input 
                    type='radio' 
                    className='mdl-radio__button' 
                    name='options'
                    value='60'
                    checked={this.state.flash === '60'}
                    onChange={this.handleFlashTimerChange}
                  />
                  <span className='mdl-radio__label'>{t('At 60 seconds')}</span>
                </label>
              </bem.FormModal__item>

              <bem.FormModal__item m={'actions'}>
                <button 
                  className='mdl-button mdl-button--colored pull-left mdl-js-ripple-effect' 
                  onClick={() => this.changeTimedGridStep(1)}
                  style={{ 'paddingLeft': 0, 'paddingRight': 0 }}
                >
                  {t('Back')}
                </button>
                <button className='mdl-button mdl-button--colored mdl-js-ripple-effect' onClick={this.cancelTimedGrid}>
                  {t('Cancel')}
                </button>
                <button 
                  className='mdl-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect'
                  onClick={this.createTimedGrid}
                >
                  {t('Create')}
                </button>
              </bem.FormModal__item>    
            </div>
          }
        </ui.Modal.Body>
      </ui.Modal>
    )
  }
}
