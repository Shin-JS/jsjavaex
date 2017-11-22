package p02.windows_event;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.JLabel;

public class CancelButtonActionListener implements ActionListener {
	JLabel label;
	
	public CancelButtonActionListener(JLabel label) {
		this.label = label;
	}

	@Override
	public void actionPerformed(ActionEvent e) {
		label.setText("      ");
	}

}
