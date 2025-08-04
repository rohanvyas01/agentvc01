# Simplified Modifications for app.py - Only for reverse_move and build_reverse_command functions

# 1. Update build_reverse_command function to accept selected_surface parameter
    """
    Build the standard extruder change command block for a forward (adjacent) move.
    Moves from `from_extruder` to `to_extruder` using the confirmed calibration data.
    """
    # Get target calibration values for the 'to_extruder'
    position = extruder_positions.get(to_extruder, 0)
    positiony = extruder_positions_y.get(to_extruder, 0)
    positionz = extruder_positions_z.get(to_extruder, 0)
    
    # Determine the printhead name from extruder number for preset lookup.
    extruder_to_printhead = {0: "Printhead 1", 1: "Printhead 2", 2: "Printhead 3"}
    target_printhead = extruder_to_printhead.get(to_extruder, "Printhead 1")
    preset = printhead_presets.get(target_printhead, {})
    temp = preset.get("temperature", 28)
    extrate = preset.get("extrusionRate", 100)
    nozzle = preset.get("nozzleDiameter", 0.4)
    
    # Set coordinates based on selected surface
    if selected_surface == "Well plate":
        reset_x, reset_y, reset_z_offset = -4.9, -8.5, 18.4
    else:  # Default for Petri dish and other surfaces
        reset_x, reset_y, reset_z_offset = -4.9, -8.5, 18.4
    
    commands = [
        'G91 ; Set to relative positioning\n',
        'G1 E-70 F6000 ; Retract 2mm of filament\n',
        'G1 Z20 F300 ; Lift Z by 20mm\n',
        'G90\n',
        'G1 X0 Y0 F6000\n',
        'G92 E0 ; Reset extruder position\n',
        f'T{to_extruder} ; Change to extruder {to_extruder}\n',
        'G91 ; Set to absolute positioning\n',
        'M83 ; Set to absolute positioning\n',
        'G1 E-70 F6000 ; Retract 2mm of filament\n',
        f'G1 X{position} Y{positiony} F6000 ; Move to confirmed position for extruder {to_extruder}\n',
        'G91 ; Set to relative positioning\n',
        f'G1 Z{positionz} F6000 ; Move to confirmed Z position for extruder {to_extruder}\n',
        f'G92 X0 Y0 Z{20 + z_position} ; Reset position\n',
        'G90\n',
        'G1 X38 Y25 F6000\n',
        'G92 E0 ; Reset extruder position\n',
        'M82\n',
        'G1 F6000\n',
        'G90\n'
    ]
    return commands

# 2. Update build_chain_move function
def build_chain_move(from_extruder, to_extruder, extruder_positions, extruder_positions_y, extruder_positions_z, z_position, selected_surface="Petri dish"):
    """
    Build a chain-move block for a forward move between adjacent extruders.
    
    For moves from Extruder 1→2 (internal 0→1):
        - Uses:
            G91
            G1 Z+30 F1500
            G1 X[calib2] F6000   ; where [calib2] is the saved X-coordinate for Extruder 2
            G1 Z-25 F1500
            G90

    For moves from Extruder 2→3 (internal 1→2):
        - Uses:
            G91
            G1 Z30 F1500
            G1 X[calib3] F6000   ; where [calib3] is the saved X-coordinate for Extruder 3
            G1 Z-25 F1500
            G90
    """

    position = extruder_positions.get(0, 0)
    positiony = extruder_positions_y.get(0, 0)
    positionz = extruder_positions_z.get(0, 0)
    
    # Set coordinates based on selected surface
    if selected_surface == "Well plate":
        reset_x, reset_y, reset_z_offset = -8, -12.3, 18.4
    else:  # Default for Petri dish and other surfaces
        reset_x, reset_y, reset_z_offset = -8, -12.3, 18.4
    
    if from_extruder == 0 and to_extruder == 1:
        return [
            "G28 Z; Home all axes to reset to absolute zero\n",
            "G28 X Y; Home all axes to reset to absolute zero\n",
            "G90 ; Set to absolute positioning\n",
            f"G1 X{position} Y{positiony} F6000 ; Move to Calibrated  position for Extruder 0\n",
            f"G1 Z{positionz+z_position} F6000 ; Move to Calibrated Z position for Extruder 0\n",        
            "G91 ; Set to relative positioning\n",
            "G1 Z+20 F1500 ; Move Z up by 30mm\n",
            f"G1 X{extruder_positions.get(1, -119.1)} Y{extruder_positions_y.get(1, 0)} F6000 ; Move to confirmed position for Extruder 1\n",
            f"G1 Z{extruder_positions_z.get(1, 0)} F6000 ; Move to confirmed Z position for Extruder 1\n"
        ]
            
    elif from_extruder == 1 and to_extruder == 2:
        return [
            "G91 ; Set to relative positioning\n",
            "T2\n",
            'M83 ; Set to relative positioning\n',
            'G1 E-70 F6000 ; Retract 2mm of filament\n',
            'M82 ; Set to absolute positioning\n',            
            f"G1 X{extruder_positions.get(2, -119.1)} Y{extruder_positions_y.get(2, 0)} F6000 ; Move to confirmed position for Extruder 2\n",
            f"G1 Z{extruder_positions_z.get(2, 0)} F6000 ; Move to confirmed Z position for Extruder 2\n",
            f"G92 X{reset_x} Y{reset_y} Z{reset_z_offset + z_position} ; Resetting Zero\n",        
            "G90 ; Return to absolute positioning\n",
            'G1 X38 Y25 F600\n'
        ]
    else:
        return build_forward_command(from_extruder, to_extruder, extruder_positions, {}, {}, 0, {}, selected_surface)

# 3. Update build_reverse_command function
def build_reverse_command(target_extruder, extruder_positions, extruder_positions_y, extruder_positions_z, z_position, selected_surface="Petri dish"):
    """
    Build a reverse command block to return to Extruder 1's confirmed position.
    This block:
      - Homes all axes (G28),
      - Resets the coordinate system (G92),
      - Moves to the confirmed calibration coordinates for Extruder 1.
    """
    position = extruder_positions.get(0, 0)
    positiony = extruder_positions_y.get(0, 0)
    positionz = extruder_positions_z.get(0, 0)
    
    # Set coordinates based on selected surface
    if selected_surface == "Well plate":
        reset_x, reset_y, reset_z_offset = -4.9, -8.5, 18.4
    else:  # Default for Petri dish and other surfaces
        reset_x, reset_y, reset_z_offset = -4.9, -8.5, 18.4
    
    commands = [
        "G28 Z; Home all axes to reset to absolute zero\n",
        "G28 X Y; Home all axes to reset to absolute zero\n",
        "G90 ; Set to absolute positioning\n",
        f"G1 X{position} Y{positiony} F6000 ; Move to Calibrated  position for Extruder 0\n",
        f"G1 Z{positionz+z_position} F6000 ; Move to Calibrated Z position for Extruder 0\n",
        "G91 ; Set to relative positioning\n",
        "G1 Z20 F300 ; Lift Z by 20mm\n",
        "G92 E0 ; Reset extruder position\n",
        "T0 ; Change to extruder 1\n",
        'M83 ; Set to relative positioning\n',
        'G1 E-70 F6000 ; Retract 2mm of filament\n',
        'M82 ; Set to absolute positioning\n',
        "G91 ; Set to absolute positioning\n",
        f"G92 X{reset_x} Y{reset_y} Z{reset_z_offset + z_position} ; Resetting Zero\n",        
        "G90 ; Set to absolute positioning\n",
        "G1 X38 Y25 F600\n"       
    ]
    return commands

# 4. Update reverse_move_from_3_to_2_modified function
def reverse_move_from_3_to_2_modified(extruder1_coords, extruder2_offset, extruder_positions, extruder_positions_y, extruder_positions_z, z_position, selected_surface="Petri dish"):
    """
    Build a command block for the reverse edge move from Extruder 3 to 2.
    This block performs the following:
      1. Homes all axes and moves to the confirmed position for Extruder 1.
      2. Then moves (using a relative command) from Extruder 1 using the Extruder 2 offset.
    
    Parameters:
      extruder1_coords: a list containing Extruder 1's confirmed coordinates,
                        e.g. [<EXTRUDER1_X>, <EXTRUDER1_Y>, <EXTRUDER1_Z>, ...].
      extruder2_offset: the X offset for Extruder 2 (e.g., -119.1).
      reset_z: the Z value to use in the reset command (e.g., 20.9).
    
    Returns:
      A list of G-code command strings.
    """
    # Set coordinates based on selected surface
    if selected_surface == "Well plate":
        reset_x, reset_y, reset_z_offset = -4.9, -8.5, 18.4
    else:  # Default for Petri dish and other surfaces
        reset_x, reset_y, reset_z_offset = -4.9, -8.5, 18.4
    
    commands = [
        "G28 Z; Home all axes to reset to absolute zero\n",
        "G28 X Y; Home all axes to reset to absolute zero\n",
        "G90 ; Set to absolute positioning\n",
        f"G1 X{extruder1_coords[0]} Y{extruder1_coords[1]} F6000 ; Move to Calibrated position for Extruder 0\n",
        f"G1 Z{extruder1_coords[2]+ z_position} F6000 ; Move to Calibrated Z position for Extruder 0\n",
        "G91 ; Set to relative positioning\n",
        "G1 Z20 F300 ; Lift Z by 20mm\n",
        "G92 E0 ; Reset extruder position\n",
        "T1 ; Change to extruder 1\n",
        'M83 ; Set to relative positioning\n',
        'G1 E-70 F6000 ; Retract 2mm of filament\n',
        'M82 ; Set to absolute positioning\n',
        "G91 ; Set to absolute positioning\n",
        f"G1 X{extruder_positions.get(1, -119.1)} Y{extruder_positions_y.get(1, 0)} F6000 ; Move to confirmed position for Extruder 1\n",
        f"G1 Z{extruder_positions_z.get(1, 0)} F6000 ; Move to confirmed Z position for Extruder 1\n",
        f"G92 X{reset_x} Y{reset_y} Z{reset_z_offset + z_position} ; Resetting Zero\n",        
        "G90 ; Set to absolute positioning\n",
        "G1 X38 Y25 F600\n"
    ]
    return commands

# 5. Update insert_extruder_changes function - key changes in the function calls
def insert_extruder_changes(gcode_file_path, layer_groups, printhead_presets, layer_height, build_plate, infill_percentage):
    try:
        with open(gcode_file_path, 'r') as file:
            gcode_lines = file.readlines()

        new_gcode_lines = []
        current_layer = -1      # Start with -1 so that the first layer change sets it to 0
        group_index = 0
        in_group = False
        previous_printhead = None
        current_extruder = 0    # Start with Extruder 1

        # Delay mechanism for inserting pending commands
        lines_to_wait = 0

        # Mapping of printheads to extruder indices
        printhead_to_extruder = {
            'Printhead 1': 0,
            'Printhead 2': 1,
            'Printhead 3': 2,
        }

        # Fetch calibration positions from the calibration page.
        extruder_1_coords = reference_coordinates.get("extruder_1")
        extruder_2_coords = reference_coordinates.get("extruder_2")
        extruder_3_coords = reference_coordinates.get("extruder_3")

        extruder_positions = {
            0: extruder_1_coords[0] if extruder_1_coords else 0,
            1: extruder_2_coords[0] if extruder_2_coords else -119.1,
            2: extruder_3_coords[0] if extruder_3_coords else -120.9,
        }
        extruder_positions_y = {
            0: extruder_1_coords[1] if extruder_1_coords else 0,
            1: extruder_2_coords[1] if extruder_2_coords else -1.4,
            2: extruder_3_coords[1] if extruder_3_coords else 0,
        }
        extruder_positions_z = {
            0: extruder_1_coords[2] if extruder_1_coords else 0,
            1: extruder_2_coords[2] if extruder_2_coords else -1.4,
            2: extruder_3_coords[2] if extruder_3_coords else 0,
        }

        pending_extruder_commands = None
        insert_after_z_move = False
        
        # Get selected surface from build_plate
        selected_surface = build_plate.get('selectedSurface', 'Petri dish')

        for line_number, line in enumerate(gcode_lines):
            stripped_line = line.strip()
            logging.debug(f"Processing line {line_number}: {stripped_line}")

            # (1) Delay insertion if scheduled.
            if lines_to_wait > 0:
                lines_to_wait -= 1
                new_gcode_lines.append(line)
                if lines_to_wait == 0 and pending_extruder_commands:
                    logging.debug("Inserting pending extruder commands after delay.")
                    new_gcode_lines.extend(pending_extruder_commands)
                    pending_extruder_commands = None
                continue

            # (2) Check for trigger line (G1 Z... F6000) to insert pending commands.
            if insert_after_z_move and stripped_line.startswith('G1 Z') and 'F6000' in stripped_line:
                if infill_percentage == 0 and pending_extruder_commands:
                    logging.debug("Inserting pending extruder commands immediately because infill_percentage is 0.")
                    new_gcode_lines.extend(pending_extruder_commands)
                    pending_extruder_commands = None
                new_gcode_lines.append(line)
                if infill_percentage != 0:
                    lines_to_wait = 1
                insert_after_z_move = False
                logging.debug(f"Scheduled extruder change insertion after line {line_number}")
                continue

            # (3) Detect layer changes.
            if ';LAYER_CHANGE' in stripped_line:
                current_layer += 1
                logging.debug(f"Layer change detected. Current layer: {current_layer}")
                # For simplicity, use the same Z calculation for all surfaces.
                z_position = (current_layer + 1) * layer_height
                logging.debug(f"Layer {current_layer} Z position: {z_position:.2f} mm")

            # (4) Group logic (old, working method: assume inkName is a plain string).
            if group_index < len(layer_groups):
                group = layer_groups[group_index]
                if current_layer == group['start'] and not in_group:
                    # Here we assume group["inkName"] is a plain string.
                    ink_name = group["inkName"]
                    logging.debug(f"Starting new group '{ink_name}' at layer {current_layer}")
                    in_group = True
                    # Instead of looking up directly using ink_name as key,
                    # iterate over presets to find the one whose inkName matches.
                    preset_for_ink = next((p for p in printhead_presets.values() if p.get("inkName") == ink_name), {})
                    new_gcode_lines.append(
                        f';GROUP_START INK={ink_name} TEMP={preset_for_ink.get("temperature",28)} '
                        f'EXTRATE={preset_for_ink.get("extrusionRate",100)} '
                        f'NOZZLE={preset_for_ink.get("nozzleDiameter",0.412)}\n'
                    )

                    # Determine the printhead from presets using the plain ink_name.
                    printhead = next(
                        (ph for ph, preset in printhead_presets.items() if preset and preset.get("inkName") == ink_name),
                        None
                    )
                    if printhead:
                        extruder_number = printhead_to_extruder[printhead]
                    else:
                        extruder_number = 0   # Default to Extruder 1 if not found

                    # If the printhead changed between groups, schedule extruder change commands.
                    if previous_printhead and previous_printhead != printhead:
                        logging.debug(f"Extruder change: previous {current_extruder}, new {extruder_number}")
                        commands = []
                        # Case 1: Default forward move (adjacent move: e.g., 1→2 or 2→3)
                        if current_extruder < extruder_number:
                            if extruder_number - current_extruder == 1:
                                commands = build_forward_command(
                                    current_extruder, extruder_number,
                                    extruder_positions, extruder_positions_y, extruder_positions_z,
                                    z_position, printhead_presets, selected_surface
                                )
                            else:
                                for step in range(current_extruder, extruder_number):
                                    commands.extend(
                                        build_chain_move(step, step + 1, extruder_positions,
                                     extruder_positions_y, extruder_positions_z, z_position, selected_surface)
                                    )
                        else:  # Reverse moves (Cases 2 & 3: e.g., 2→1 or 3→2)
                            if extruder_number == 0:
                                # Case 2: Moving directly to Extruder 1.
                                commands = build_reverse_command(0, extruder_positions, extruder_positions_y, extruder_positions_z,
                                    z_position, selected_surface)
                            elif extruder_number == 1:
                            # Case 3: Reverse edge move from Extruder 3 to 2.
                            # Here we use extruder1_coords (confirmed calibration for Extruder 1),
                            # extruder2_offset (the X offset for Extruder 2),
                            # and reset_z (the desired Z reset value).
                                commands = reverse_move_from_3_to_2_modified(extruder_1_coords, extruder_positions.get(1, -119.1), extruder_positions, extruder_positions_y, extruder_positions_z, z_position, selected_surface)
                            else:
                            # Fallback for other reverse moves.
                                commands = []
                                commands.extend(
                                    build_reverse_command(0, extruder_positions, extruder_positions_y, extruder_positions_z, z_position, selected_surface)
                            )
                                for step in range(0, extruder_number):
                                    commands.extend(
                                        build_forward_command(
                                            step, step + 1,
                                            extruder_positions, extruder_positions_y, extruder_positions_z,
                                            z_position, printhead_presets, selected_surface
                                    )
                                )
                        if build_plate and build_plate.get('selectedSurface') == 'Petri dish':
                            commands.append(f'G1 Z{z_position:.2f} F600\n')
                            logging.debug(f"Appending 'G1 Z{z_position:.2f} F600' for Petri dish")
                        else:
                            logging.debug("Not appending 'G1 Z... F600' because surface is not Petri dish")      
                        pending_extruder_commands = commands
                        insert_after_z_move = True
                        current_extruder = extruder_number

                    previous_printhead = printhead

                if current_layer == group['end'] + 1:
                    new_gcode_lines.append(f';GROUP_END INK={group["inkName"]}\n')
                    group_index += 1
                    in_group = False

            new_gcode_lines.append(line)

        if pending_extruder_commands and insert_after_z_move:
            new_gcode_lines.extend(pending_extruder_commands)

        with open(gcode_file_path, 'w') as file:
            file.writelines(new_gcode_lines)

        logging.debug(f"Extruder changes inserted successfully into {gcode_file_path}")

    except Exception as e:
        logging.error(f"Error inserting extruder changes: {str(e)}")
        raise

# 6. Update save-protocol1 route to pass selected_surface
@app.route('/save-protocol1', methods=['POST'])
def save_protocol1():
    try:
        data = request.get_json()
        protocol_name = data.get('protocol_name')
        layer_groups = data.get('layerGroups')
        gcode_file_path = data.get('gcode_file_path')
        printhead_presets = data.get('printhead_presets')
        slicing_settings = data.get('slicing_settings',{})  # Ensure slicing settings are fetched
        surface_name = data.get('surface_name')
        layer_height = slicing_settings.get('layerHeight', 0.7)
        build_plate = slicing_settings.get('buildPlate', {})
        infill_percentage = slicing_settings.get('infillPercentage', {})
        
        # Get selected surface - ADD THIS LINE
        selected_surface = data.get('selected_surface', surface_name)  # Use surface_name as fallback

        # If build_plate is empty, construct it using surface_name
        if not build_plate:
            build_plate = {'selectedSurface': surface_name}

        # Set default values for missing printhead presets
        for i in range(1, 4):  # Assuming 3 printheads
            preset_key = f'Printhead {i}'
            if preset_key not in printhead_presets or printhead_presets[preset_key] is None:
                printhead_presets[preset_key] = {
                    "temperature": None,
                    "extrusionRate": None,
                    "nozzleDiameter": None,
                    "inkName": None
                }

        current_extruder = 0
        logging.debug(f"Received data for saving protocol: {json.dumps(data, indent=2)}")
        logging.debug(f"Printhead presets received: {printhead_presets}")

        if not protocol_name:
            logging.error("Protocol name is missing")
            return jsonify({"error": "Protocol name is required"}), 400
        if not layer_groups:
            logging.error("Layer groups are missing")
            return jsonify({"error": "Layer groups are required"}), 400
        if not gcode_file_path:
            logging.error("G-code file path is missing")
            return jsonify({"error": "G-code file path is required"}), 400
        if not printhead_presets:
            logging.error("Printhead presets are missing")
            return jsonify({"error": "Printhead presets are required"}), 400

        protocol_data = {
            "protocol_name": protocol_name,
            "layer_groups": layer_groups,
            "gcode_file_path": gcode_file_path,
            "printhead_presets": printhead_presets,
            "slicing_settings": slicing_settings,  # Add slicing settings to the JSON
            "surface_name": surface_name,
            "selected_surface": selected_surface  # ADD THIS LINE
        }

        protocol_file_path = os.path.join('saved_protocols', f'{protocol_name}.json')
        os.makedirs('saved_protocols', exist_ok=True)

        with open(protocol_file_path, 'w') as f:
            json.dump(protocol_data, f)

        logging.debug(f"Protocol saved to {protocol_file_path}")
        
        layer_height=np.float64(layer_height)
        
        # Insert group markers into the G-code file
        #insert_group_markers(gcode_file_path, layer_groups, printhead_presets)

        insert_extruder_changes(gcode_file_path, layer_groups, printhead_presets, layer_height, build_plate, infill_percentage)

        logging.debug(f"G-code file updated with markers and extruder changes: {gcode_file_path}")

        return jsonify({"message": "Protocol saved and G-code updated successfully"}), 200

    except Exception as e:
        logging.error(f"Error saving protocol: {str(e)}")
        return jsonify({"error": str(e)}), 500