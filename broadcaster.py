import asyncio
import websockets
import irsdk
import time
import json

# simple routine to send data to server over websocket
async def send(data):
    uri = "ws://orldiscordbot-env.eba-zhcidp9s.us-west-2.elasticbeanstalk.com"
    async with websockets.connect(uri) as websocket:
        print(data)
        await websocket.send(data)
        response = await websocket.recv()
        print(response)

# this is our State class, with some helpful variables
class State:
    ir_connected = False
    last_weekend_info_tick = -1
    last_driver_info_tick = -1
    last_session_info_tick = -1
    last_positions_tick = -1
    last_session_num_tick = -1

# here we check if we are connected to iracing
# so we can retrieve some data
def check_iracing():
    if state.ir_connected and not (ir.is_initialized and ir.is_connected):
        state.ir_connected = False
        # don't forget to reset your State variables
        state.last_weekend_info_tick = -1
        state.last_driver_info_tick = -1
        state.last_session_info_tick = -1
        state.last_positions_tick = -1
        state.last_session_num_tick = -1
        # we are shutting down ir library (clearing all internal variables)
        ir.shutdown()
        print('irsdk disconnected')
    elif not state.ir_connected and ir.startup(test_file='irsdkData.bin') and ir.is_initialized and ir.is_connected:
        state.ir_connected = True
        print('irsdk connected')
        
# our main loop, where we retrieve data
# and do something useful with it
async def loop():
    # on each tick we freeze buffer with live telemetry
    # it is optional, but useful if you use vars like CarIdxXXX
    # this way you will have consistent data from those vars inside one tick
    # because sometimes while you retrieve one CarIdxXXX variable
    # another one in next line of code could change
    # to the next iracing internal tick_count
    # and you will get inconsistent data
    ir.freeze_var_buffer_latest()

    # retrieve WeekendInfo from session data
    # we also check if data has been updated
    # with ir.get_session_info_update_by_key(key)
    # but first you need to request data, before checking if its updated
    weekend_info = ir['WeekendInfo']
    if weekend_info:
        weekend_info_tick = ir.get_session_info_update_by_key('WeekendInfo')
        if weekend_info_tick != state.last_weekend_info_tick:
            state.last_weekend_info_tick = weekend_info_tick
            send(json.dumps({
              "trackName": weekend_info['TrackDisplayName'],
              "trackId": weekend_info['TrackID'],
              "skies": weekend_info['TrackSkies'],
              "surfaceTemp": weekend_info['TrackSurfaceTemp'],
              "airTemp": weekend_info['TrackAirTemp'],
              "leagueId": weekend_info['LeagueID'],
              "subsessionId": weekend_info['SubSessionID']
            }))
            
    driver_info = ir['DriverInfo']
    if driver_info:
        driver_info_tick = ir.get_session_info_update_by_key('DriverInfo')
        if driver_info_tick != state.last_driver_info_tick:
            state.last_driver_info_tick = driver_info_tick
            # await send(json.dumps({ "drivers": map(lambda a: a['UserID'], driver_info['Drivers']) }))
            await send(json.dumps({ "drivers": driver_info['Drivers'] }))

    session_info = ir['SessionInfo']
    if session_info:
        session_info_tick = ir.get_session_info_update_by_key('SessionInfo')
        if session_info_tick != state.last_session_info_tick:
            state.last_session_info_tick = session_info_tick
            await send(json.dumps({ "sessions": session_info['Sessions'] }))

    positions = ir['CarIdxPosition']
    if positions:
        positions_tick = ir.get_session_info_update_by_key('CarIdxPosition')
        if positions_tick != state.last_positions_tick:
            state.last_positions_tick = positions_tick
            await send(json.dumps({ "positions": positions }))
            
    session_num = ir['SessionNum']
    if session_num:
        session_num_tick = ir.get_session_info_update_by_key('SessionNum')
        if session_num_tick != state.last_session_num_tick:
            state.last_session_num_tick = session_num_tick
            await send(json.dumps({ "sessionNum": session_num }))
    
    # send(json.dumps({ "state": session_state }))
    # send(json.dumps({ "flags": session_flags }))


if __name__ == '__main__':
    # initializing ir and state
    ir = irsdk.IRSDK()
    state = State()

    try:
        # infinite loop
        while True:
            # check if we are connected to iracing
            check_iracing()
            # if we are, then process data
            if state.ir_connected:
                asyncio.get_event_loop().run_until_complete(loop())
            # sleep for 1 second
            # maximum you can use is 1/60
            # cause iracing updates data with 60 fps
            time.sleep(1)
    except KeyboardInterrupt:
        # press ctrl+c to exit
        pass